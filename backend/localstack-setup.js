const fs = require('fs');
const { exec } = require('child_process');
const AWS = require('@aws-sdk/client-dynamodb');
const { DynamoDBClient, CreateTableCommand } = AWS;
const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { LambdaClient, CreateFunctionCommand } = require('@aws-sdk/client-lambda');

// LocalStack configuration
const endpoint = 'http://localhost:4566';
const region = 'us-east-1';
const credentials = {
  accessKeyId: 'test',
  secretAccessKey: 'test'
};

// Create clients
const dynamoClient = new DynamoDBClient({
  endpoint,
  region,
  credentials
});

const s3Client = new S3Client({
  endpoint,
  region,
  credentials,
  forcePathStyle: true
});

const lambdaClient = new LambdaClient({
  endpoint,
  region,
  credentials
});

// Setup S3 bucket avec CORS
async function setupS3() {
  try {
    const bucketName = 'student-notes-bucket';
    
    console.log(`Creating S3 bucket: ${bucketName}`);
    
    const createBucketParams = {
      Bucket: bucketName
    };
    
    try {
      await s3Client.send(new CreateBucketCommand(createBucketParams));
      console.log(`S3 bucket created: ${bucketName}`);
      
      // Configuration CORS pour le bucket
      const corsParams = {
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*", "x-amz-sdk-checksum-algorithm", "x-amz-content-sha256", "x-amz-date", "authorization"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: ["ETag"]
            }
          ]
        }
      };
      
      await s3Client.send(new PutBucketCorsCommand(corsParams));
      console.log('CORS configuration set for bucket');
      
    } catch (error) {
      if (error.name !== 'BucketAlreadyExists' && error.name !== 'BucketAlreadyOwnedByYou') {
        throw error;
      }
      console.log(`S3 bucket already exists: ${bucketName}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up S3:', error);
    return false;
  }
}

// Setup DynamoDB tables
async function setupDynamoDB() {
  try {
    // Create Notes table
    const notesTableParams = {
      TableName: 'Notes',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'subjectId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'SubjectIndex',
          KeySchema: [
            { AttributeName: 'subjectId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    console.log('Creating DynamoDB table: Notes');
    try {
      await dynamoClient.send(new CreateTableCommand(notesTableParams));
      console.log('DynamoDB table created: Notes');
    } catch (error) {
      if (error.name !== 'ResourceInUseException') {
        throw error;
      }
      console.log('DynamoDB table already exists: Notes');
    }
    
    // Create Subjects table
    const subjectsTableParams = {
      TableName: 'Subjects',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
    
    console.log('Creating DynamoDB table: Subjects');
    try {
      await dynamoClient.send(new CreateTableCommand(subjectsTableParams));
      console.log('DynamoDB table created: Subjects');
    } catch (error) {
      if (error.name !== 'ResourceInUseException') {
        throw error;
      }
      console.log('DynamoDB table already exists: Subjects');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up DynamoDB:', error);
    return false;
  }
}

// Setup Lambda functions
async function setupLambda() {
  try {
    // Create search function
    const searchFunctionCode = `
      exports.handler = async (event) => {
        const { query } = event;
        
        // This would search through DynamoDB for matching notes
        // For simplicity, we're returning a mock response
        return {
          statusCode: 200,
          body: JSON.stringify({
            results: [
              {
                id: 'search-result-1',
                title: 'Search result for: ' + query,
                subject: 'Example Subject'
              }
            ]
          })
        };
      };
    `;
    
    // Create a zip file for the Lambda function
    fs.writeFileSync('/tmp/search-function.js', searchFunctionCode);
    
    return new Promise((resolve, reject) => {
      exec('cd /tmp && zip -r search-function.zip search-function.js', async (error) => {
        if (error) {
          console.error('Error creating zip file:', error);
          return reject(false);
        }
        
        try {
          const zipFile = fs.readFileSync('/tmp/search-function.zip');
          
          const createFunctionParams = {
            FunctionName: 'search-notes',
            Runtime: 'nodejs14.x',
            Role: 'arn:aws:iam::000000000000:role/lambda-role',
            Handler: 'search-function.handler',
            Code: {
              ZipFile: zipFile
            },
            Description: 'Function to search notes',
            Timeout: 30,
            MemorySize: 128
          };
          
          console.log('Creating Lambda function: search-notes');
          try {
            await lambdaClient.send(new CreateFunctionCommand(createFunctionParams));
            console.log('Lambda function created: search-notes');
            resolve(true);
          } catch (error) {
            if (error.name !== 'ResourceConflictException') {
              console.error('Error creating Lambda function:', error);
              return reject(false);
            }
            console.log('Lambda function already exists: search-notes');
            resolve(true);
          }
        } catch (error) {
          console.error('Error setting up Lambda:', error);
          reject(false);
        }
      });
    });
  } catch (error) {
    console.error('Error setting up Lambda:', error);
    return false;
  }
}

// Run the setup
async function runSetup() {
  console.log('Starting LocalStack resources setup...');
  
  try {
    const s3Success = await setupS3();
    const dynamoSuccess = await setupDynamoDB();
    const lambdaSuccess = await setupLambda();
    
    if (s3Success && dynamoSuccess && lambdaSuccess) {
      console.log('Setup completed successfully!');
    } else {
      console.log('Setup completed with some errors.');
    }
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

runSetup();