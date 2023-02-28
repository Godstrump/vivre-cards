import { SES } from "aws-sdk";

const ses = new SES({ region: "us-east-1" });

async function sendMail(event) {
    var data = JSON.parse(event.body);

    const params = {
        Source: data.source,
        Destination: {
            ToAddresses: [data.email],
        },
        Message: {
            Body: {
                Html: {
                    Data: data.message,
                },
            },
            Subject: {
                Data: data.subject,
            },
        },
    };

    try {
        const result = await ses.sendEmail(params).promise();
        console.log(result);

        return {
            statusCode: 200,
            body: "Email sent successfully",
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: error,
        };
    }
}

export const handler = sendMail;
