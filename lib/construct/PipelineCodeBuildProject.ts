import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildProjectProps } from '../interfaces/Props';

/**
 * LINUX_IMAGE_MAP maps the ProgrammingLanguage to the appropriate CodeBuild image.
 */
const LINUX_IMAGE_MAP: Record<string, codebuild.IBuildImage> = {
  "Node12": codebuild.LinuxBuildImage.STANDARD_5_0,
  "Node16": codebuild.LinuxBuildImage.STANDARD_6_0,
  "Node18": codebuild.LinuxBuildImage.STANDARD_7_0,
  "Python3.8": codebuild.LinuxBuildImage.STANDARD_5_0,
  "Python3.10": codebuild.LinuxBuildImage.STANDARD_6_0,
  "Python3.11": codebuild.LinuxBuildImage.STANDARD_7_0,
}

/**
 * COMPUTE_SIZE_MAP maps the ComputeSize to the appropriate CodeBuild compute type.
 */
const COMPUTE_SIZE_MAP: Record<string, codebuild.ComputeType> = {
  "Small": codebuild.ComputeType.SMALL,
  "Medium": codebuild.ComputeType.MEDIUM,
  "Large": codebuild.ComputeType.LARGE,
  "X2Large": codebuild.ComputeType.X2_LARGE,
};

/**
 * PipelineBuildProject creates a CodeBuild project that uses AWS CodePipeline as a source.
 */
export class PipelineBuildProject extends Construct {
  // Expose the CodeBuild project interface for the pipeline
  public readonly project: codebuild.IProject;

  constructor(scope: Construct, id: string, props: CodeBuildProjectProps) {
    super(scope, id);

    // Create the CodeBuild project
    this.project = new codebuild.PipelineProject(this, this.generateName(props.Name, 'project'), {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      role: props.CodeBuildRole,
      projectName: this.generateName(props.Name, 'project'),
      environment: {
        buildImage: LINUX_IMAGE_MAP[props.ProgrammingLanguage],
        computeType: COMPUTE_SIZE_MAP[props.ComputeSize],
      },
    });
  }

  /**
   * Generates string name for multiple resources.
   * @param base - The base name of the resource.
   * @param suffix - The resource type.
   * @returns - formatted string name.
   */
  private generateName(base: string, suffix: string): string {
    return `cdk-pipelines-${base}-${suffix}`;
  }
}
