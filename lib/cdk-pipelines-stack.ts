import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { CreateECSPipelineStage } from './resources/Stages';

export class CdkPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const CONNECTION_ARN = process.env.CONNECTION_ARN || 'arn:aws:codestar-connections:us-east-1:123456789012:connection/11111111-222-3333-4444-555555666666';
    const REPO = process.env.REPO || 'my-repo';
    const OWNER = process.env.OWNER || 'my-owner';

    const codepipelineArtifactBucket = new s3.Bucket(this, 'CodePipelineArtifactBucket', {
      bucketName: 'cdk-pipelines-artifact-bucket.alfonsoledesmaa.com',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const codepipelineRole = new iam.Role(this, 'CodePipelineRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
      roleName: 'cdk-pipelines-codepipeline-role',
    });

    codepipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: ['codebuild:*', 's3:*', 'codestar-connections:*', 'cloudfromation:*'],
      resources: ['*'],
    }));

    const pipeline = new CodePipeline(this, 'Pipeline', {
      artifactBucket: codepipelineArtifactBucket,
      role: codepipelineRole,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(`${OWNER}/${REPO}`, 'cdk-pipelines',
        {
            connectionArn: CONNECTION_ARN,
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    pipeline.addStage(new CreateECSPipelineStage(this, 'EcsPipeline', {
      EcsClusterName: 'test-cluster',
      EcsServiceName: 'test-service',
      RepoName: REPO,
      RepoOwner: OWNER,
      RepoBranch: 'main',
      ConnectionString: CONNECTION_ARN,
      PipelineName: 'EcsPipeline',
    }));
  }
}