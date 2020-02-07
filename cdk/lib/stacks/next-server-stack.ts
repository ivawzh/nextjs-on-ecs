import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2";

export interface NextServerStackProps {
  readonly vpc: ec2.IVpc;
  readonly nextServerAlbSg: ec2.SecurityGroup;
}

export class NextServerStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: NextServerStackProps & cdk.StackProps
  ) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "nextjs-on-ecs-cluster", {
      clusterName: "nextjs-on-ecs-cluster",
      vpc: props.vpc
    });

    const alb = new elb.ApplicationLoadBalancer(
      this,
      "nextjs-on-ecs-server-alb",
      {
        loadBalancerName: "nextjs-on-ecs-server-alb",
        vpc: props.vpc,
        internetFacing: true,
        securityGroup: props.nextServerAlbSg
      }
    );
    const listener = alb.addListener("nextjs-on-ecs-server-alb-listener", {
      port: 80,
      open: true
    });
    const targetGroup = new elb.ApplicationTargetGroup(
      this,
      "nextjs-on-ecs-server-target",
      {
        targetGroupName: "nextjs-on-ecs-server-target",
        targetType: elb.TargetType.IP,
        port: 80,
        vpc: props.vpc
      }
    );
    listener.addTargetGroups("nextjs-on-ecs-server-target-default", {
      targetGroups: [targetGroup]
    });

    const repository = new ecr.Repository(this, "nextjs-on-ecs-server-ecr", {
      repositoryName: "nextjs-on-ecs-server"
    });
  }
}