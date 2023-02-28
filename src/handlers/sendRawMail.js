import { SES } from "aws-sdk";

const ses = new SES({ region: "us-east-1" });

async function sendRawMail(event) {
    var data = JSON.parse(event.body);

    const params = {
        Source: data.source,
        Destinations: {
            ToAddresses: [data.email],
        },
        RawMessage: {
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
        const result = await ses.sendRawEmail(params).promise();
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

export const handler = sendRawMail;
