# CloudFormation Explode List Macro

This is a CloudFormation Macro that loops over a list and generates a unique resource for each item in it.

## Example
Here's a CloudFormation template before the macro transformation is applied:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: ExplodeList

Resources:
  TestRoute:
    Type: AWS::EC2::Route
    ExplodeList:
      - 10.0.48.0/24
      - 10.0.112.0/24
      - 10.0.176.0/24
    Properties:
      DestinationCidrBlock: !InsListItem
      TransitGatewayId: tgw-a1b2c3d4
      RouteTableId: rtb-a1b2c3e4
```

And here's the output which is then sent to CloudFormation for deployment.

```yaml
AWSTemplateFormatVersion: "2010-09-09"

Resources:
  TestRouteedb024d:
    Type: AWS::EC2::Route
    Properties:
      DestinationCidrBlock: 10.0.48.0/24
      TransitGatewayId: tgw-a1b2c3d4
      RouteTableId: rtb-a1b2c3e4

  TestRoute11180275:
    Type: AWS::EC2::Route
    Properties:
      DestinationCidrBlock: 10.0.112.0/24
      TransitGatewayId: tgw-a1b2c3d4
      RouteTableId: rtb-a1b2c3e4

  TestRoute115a027f:
    Type: AWS::EC2::Route
    Properties:
      DestinationCidrBlock: 10.0.176.0/24
      TransitGatewayId: tgw-a1b2c3d4
      RouteTableId: rtb-a1b2c3e4
```

## Allowed List Types

YAML and JSON Lists and CommaDelimitedLists are allowed. These values can be passed directly to the resource's `ExplodeList` property, or via template Parameters using the `!RefList` tag.

```yaml
Parameters:
  SomeList:
    Type: CommaDelimitedList
    Default: aaaaa,bbbbb,ccccc

Resources:
  SomeResource:
    Type: AWS::Some::Resource
    ExplodeList: !RefList SomeList

  SomeOtherResource:
    Type: AWS::SomeOther::Resource
    ExplodeList: aaaaa,bbbbb,ccccc

  AnotherResource:
    Type: AWS::Another::Resource
    ExplodeList:
      - aaaaa
      - bbbbb
      - ccccc
```

> Note: Since macros preprocess CloudFormation templates, references to other resources and outputs thereof cannot be passed to the `ExplodeList` property. In other words, the list values need to be available at the time of template preprocessing.

## Deploy
