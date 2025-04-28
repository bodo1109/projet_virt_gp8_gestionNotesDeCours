import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable({
  providedIn: 'root'
})
export class AwsService {
  private s3Client: S3Client;
  private dynamoClient: DynamoDBDocumentClient;
  private lambdaClient: LambdaClient;
  
  // Localstack configuration
  private readonly endpoint = 'http://localhost:4566';
  private readonly region = 'us-east-1';
  private readonly bucketName = 'student-notes-bucket';
  
  constructor() {
    // Configure AWS SDK clients to use Localstack
    const s3 = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      },
      forcePathStyle: true // Required for LocalStack
    });
    
    const dynamoDBClient = new DynamoDBClient({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    });
    
    this.dynamoClient = DynamoDBDocumentClient.from(dynamoDBClient);
    
    this.lambdaClient = new LambdaClient({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    });
    
    this.s3Client = s3;
  }
  
  // S3 Operations
  
  uploadFile(key: string, body: File): Observable<any> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: body.type
    });
    
    return from(this.s3Client.send(command));
  }
  
  getFileUrl(key: string, expiresIn: number = 3600): Observable<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });
    
    return from(getSignedUrl(this.s3Client, command, { expiresIn }));
  }
  
  deleteFile(key: string): Observable<any> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });
    
    return from(this.s3Client.send(command));
  }
  
  // DynamoDB Operations
  
  putItem(params: any): Observable<any> {
    const command = new PutCommand(params);
    return from(this.dynamoClient.send(command));
  }
  
  getItem(params: any): Observable<any> {
    const command = new GetCommand(params);
    return from(this.dynamoClient.send(command));
  }
  
  queryItems(params: any): Observable<any> {
    const command = new QueryCommand(params);
    return from(this.dynamoClient.send(command));
  }
  
  deleteItem(params: any): Observable<any> {
    const command = new DeleteCommand(params);
    return from(this.dynamoClient.send(command));
  }
  
  // Lambda Operations
  
  invokeLambda(functionName: string, payload: any): Observable<any> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify(payload))
    });
    
    return from(this.lambdaClient.send(command));
  }
}