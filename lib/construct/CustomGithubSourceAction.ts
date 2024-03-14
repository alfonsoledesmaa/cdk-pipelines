import { Construct } from 'constructs';
import { CodeStarConnectionsSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { CustomGithubSourceActionProps } from '../interfaces/Props';

/**
 * CustomGithubSourceAction creates a CodeStarConnectionsSourceAction for a GitHub repository.
 */
export class CustomGithubSourceAction extends Construct {
  public readonly sourceAction: CodeStarConnectionsSourceAction;
  public readonly sourceOutput: Artifact;

  constructor(scope: Construct, id: string, props: CustomGithubSourceActionProps) {
    super(scope, id);

    this.sourceOutput = new Artifact();
    this.sourceAction = new CodeStarConnectionsSourceAction({
      actionName: id,
      owner: props.GithubOwner,
      connectionArn: props.GithubCodeStarConnectionString,
      output: this.sourceOutput,
      repo: props.GithubRepo,
    });
  }
}