import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateService } from 'aws-cdk-lib/aws-ecs';
import { EcsDeploymentActionProps } from '../interfaces/Props';
import { EcsDeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';

/**
 * EcsDeploymentAction encapsulates the logic of an EcsDeployAction for a Fargate service.
 */
export class EcsDeploymentAction extends Construct {
  public readonly deployAction: EcsDeployAction;

  constructor(scope: Construct, id: string, props: EcsDeploymentActionProps) {

    super(scope, id);

      const vpc = Vpc.fromLookup(this, 'VPC', { isDefault: true });
      const cluster = Cluster.fromClusterAttributes(this, 'ExistingCluster', {
        clusterName: props.ClusterName,
        vpc: vpc,
        securityGroups: [], // optional
      });
      const service = FargateService.fromFargateServiceAttributes(this, 'ExistingService', {
        serviceName: props.ServiceName,
        cluster: cluster,
      });

      this.deployAction = new EcsDeployAction({
        actionName: id,
        service: service,
      });
    }
}