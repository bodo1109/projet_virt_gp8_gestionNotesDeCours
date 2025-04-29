// src/app/services/aws.service.ts 
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteItemCommand, DeleteItemCommandInput } from '@aws-sdk/client-dynamodb';


@Injectable({
  providedIn: 'root'
})
export class AwsService {
  private s3Client: S3Client;
  private dynamoClient: DynamoDBDocumentClient;
  private lambdaClient: LambdaClient;

  private readonly endpoint = 'http://localhost:4566';
  private readonly region = 'us-east-1';
  private readonly bucketName = 'student-notes-bucket';

  constructor() {
    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      },
      forcePathStyle: true
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
  }

  // Version PROMISE (async/await)
  async uploadFile(key: string, file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: uint8Array,
      ContentType: file.type
    });

    await this.s3Client.send(command);
    return key;
  }

  // aws.service.ts
scan(params: any): Observable<any> {
  const command = new ScanCommand(params);
  return from(this.dynamoClient.send(command));
}

  scanTable(tableName: string): Observable<any> {
    const params = {
      TableName: tableName
    };
  
    return from(this.dynamoClient.send(new ScanCommand(params)));
  }

  async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    const response = await this.s3Client.send(command);
    const arrayBuffer = await response.Body?.transformToByteArray();
    if (!arrayBuffer) {
      throw new Error('Failed to read file content');
    }

    return new TextDecoder().decode(arrayBuffer);
  }

  // Version OBSERVABLE
  uploadFileObservable(key: string, body: File): Observable<any> {
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

  deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: 'student-notes-bucket',
      Key: key
    };
    return this.s3Client.send(new DeleteObjectCommand(params)).then(() => {});
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

  deleteItem(params: DeleteItemCommandInput): Observable<any> {
    return from(this.dynamoClient.send(new DeleteItemCommand(params)));
  }
  

  // Lambda Operations
  invokeLambda(functionName: string, payload: any): Observable<any> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: new TextEncoder().encode(JSON.stringify(payload))
    });

    return from(this.lambdaClient.send(command));
  }
  
}
