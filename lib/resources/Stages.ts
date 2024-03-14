import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EcsPipelineStack } from './EcsPipeline';
import { EcsPipelineStageProps } from '../interfaces/Props';

export class CreateECSPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props: EcsPipelineStageProps) {
      super(scope, id, props);
      new EcsPipelineStack(this, 'EcsPipeline', {
        PipelineName: props.PipelineName,
        RepoName: props.RepoName,
        Branch: props.RepoBranch,
        RepoOwner: props.RepoOwner,
        GithubCodeStarConnectionString: props.ConnectionString,
        EcsServiceName: props.EcsServiceName,
        EcsClusterName: props.EcsClusterName,
      });
    }
  }