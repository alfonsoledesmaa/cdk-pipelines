import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { PipelineBuildProject } from '../construct/PipelineCodeBuildProject';
import { CustomGithubSourceAction } from '../construct/CustomGithubSourceAction';
import { EcsDeploymentAction } from '../construct/EcsDeploymentAction';

interface EcsPipelineStackProps extends StackProps {
  PipelineName: string;
  RepoName: string;
  Branch: string;
  ProgrammingLanguage?: string;
  ComputeSize?: string;
  RepoOwner: string;
  GithubCodeStarConnectionString: string;
  EcsServiceName: string;
  EcsClusterName: string;
}

/**
 * Creates a Pipeline to build and deploy a containerized application to Amazon ECS
 */
export class EcsPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsPipelineStackProps) {

    const pipelineName = `cdk-pipelines-${props.PipelineName}`;
    const computeType = props.ComputeSize || 'Small';
    const programmingLanguage = props.ProgrammingLanguage  || 'Node16';

    super(scope, pipelineName, props);

    // Import a previously created role
    const pipelineImportedRole = iam.Role.fromRoleArn(this, 'PipelineImportedRole', Fn.importValue('SharedCodePipelineRoleArn'), {mutable: false});

    // Creates a new role for CodeBuild
    const codeBuildRole = new iam.Role(this, 'CodeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });

    const codeBuildPolicy = new iam.PolicyStatement({
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:PutObject",
        "codebuild:CreateReportGroup",
        "codebuild:CreateReport",
        "codebuild:UpdateReport",
        "codebuild:BatchPutTestCases",
        "codebuild:StartBuild",
        "codebuild:BatchGetBuilds",
        "codebuild:BatchGetProjects",
        "codebuild:BatchGetReportGroups",
        "codebuild:BatchGetReports",
        "codebuild:BatchGetBuildBatches",
        "codebuild:ListBuildBatches",
        "codebuild:ListBuildBatchesForProject",
        "codebuild:ListBuilds",
        "codebuild:ListBuildsForProject",
        "codebuild:ListProjects",
        "codebuild:ListReportGroups",
        "codebuild:ListReports",
        "codebuild:ListReportsForReportGroup",
        "codebuild:ListSharedReportGroups",
        "codebuild:DescribeTestCases",
        "codebuild:ListCuratedEnvironmentImages",
        "ecr:*",
      ],
      resources: ['*'],
    });
    
    codeBuildRole.addToPolicy(codeBuildPolicy);

    const buildProject = new PipelineBuildProject(this, `cdk-pipeline-${props.PipelineName}-codebuild-project`, {
      Name: props.PipelineName,
      ComputeSize: computeType, 
      ProgrammingLanguage: programmingLanguage,
      CodeBuildRole: codeBuildRole,
    });

    const codeBuildProjectReference: codebuild.IProject = buildProject.project;

    const sourceAction = new CustomGithubSourceAction(this, 'SourceAction', {
      GithubRepo: props.RepoName,
      GithubOwner: props.RepoOwner,
      GithubCodeStarConnectionString: props.GithubCodeStarConnectionString,
    });

    const deployAction = new EcsDeploymentAction(this, 'EcsDeploymentAction', {
      ClusterName: props.EcsClusterName,
      ServiceName: props.EcsServiceName,
    });

    const pipeline = new codepipeline.Pipeline(this, props.PipelineName, {
      pipelineName: pipelineName,
      role: pipelineImportedRole,
      stages: [{
        stageName: 'Source',
        actions: [
          sourceAction.sourceAction,
        ]
      },
      {
        stageName: 'BuildContainerImage',
        actions: [
          new codepipeline_actions.CodeBuildAction({
            actionName: 'Build',
            project: codeBuildProjectReference,
            input: sourceAction.sourceOutput,
          }),
        ],
      },
      {
        stageName: 'DeployEcsService',
        actions: [
          deployAction.deployAction,
        ],
      }
      ],
    });
    
  }
}