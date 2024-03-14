import { StageProps } from 'aws-cdk-lib';
import { IRole } from 'aws-cdk-lib/aws-iam';

export interface CodeBuildProjectProps {
    ProgrammingLanguage: string;
    CodeBuildRole: IRole;
    ComputeSize: string;
    Name: string;
}

export interface CustomGithubSourceActionProps {
    GithubCodeStarConnectionString: string;
    GithubOwner: string;
    GithubRepo: string;
}

export interface EcsDeploymentActionProps {
    ClusterName: string;
    ServiceName: string;
}

export interface EcsPipelineStageProps extends StageProps{
    EcsClusterName: string;
    EcsServiceName: string;
    RepoName: string;
    RepoOwner: string;
    RepoBranch: string;
    ConnectionString: string;
    PipelineName: string;
}