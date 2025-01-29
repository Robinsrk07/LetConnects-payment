const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '../protos/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

const verifyAuth = (token) => {
    return new Promise((resolve, reject) => {
        client.AuthenticateUser({ token }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};

module.exports = { verifyAuth };