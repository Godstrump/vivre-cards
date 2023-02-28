const AWS = require("aws-sdk");
const config = require("./config");
const fs = require("fs");

const AWS_PROFILE = config.aws_profile;
const AWS_REGION = config.aws_region;
const AWS_MEDIA_BUCKET = config.aws_media_bucket;
const AWS_ACCESS_KEY = config.aws_access_key;
const AWS_SECRET_ACCESS_KEY = config.aws_secret_key;

//Configure AWS
if (AWS_PROFILE !== "DEPLOYED") {
    var credentials = new AWS.SharedIniFileCredentials({
        profile: AWS_PROFILE,
    });
    AWS.config.credentials = credentials;
}

const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    signatureVersion: "v4",
    params: { Bucket: AWS_MEDIA_BUCKET },
});

/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
exports.getGetSignedUrl = (key) => {
    const signedUrlExpireSeconds = 60 * 10;

    const url = s3.getSignedUrl("getObject", {
        Bucket: AWS_MEDIA_BUCKET,
        Key: key,
        Expires: signedUrlExpireSeconds,
    });

    return url;
};

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
exports.getPutSignedUrl = async (path, key) => {
    var data = fs.createReadStream(path);

    const url = await s3.putObject(
        {
            Bucket: AWS_MEDIA_BUCKET,
            Key: key,
            Body: data,
        },
        (err, data) => {
            if (err) throw err;
            else return data;
        }
    );
    return url;
};
