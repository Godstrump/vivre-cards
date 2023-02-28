exports.greeting = (fullname) =>
    `<p style="color: rgb(4, 40, 46);font-size: small; font-family: proxima, Helvetica, Arial; font-weight: bold;margin-top: 20px;line-height:150%;">Hi ${
        fullname ?? ""
    },</p>`;

exports.paragraph = (text) => {
    return `<p style="color: rgb(4, 40, 46); font-size: small; font-family: proxima, Helvetica, Arial; margin-top: 20px; line-height: 150%;">
    ${text ?? ""}
</p>`;
};

exports.div = (body) => {
    return `<div style="color: rgb(4, 40, 46); font-size: small; font-family: proxima, Helvetica, Arial; margin-top: 20px; line-height: 150%;">${
        body ?? ""
    }</div>`;
};

exports.span = (text) => {
    return `<span style="font-weight: bold; color: inherit; font-size: inherit; font-family: inherit; line-height: inherit;">${text}</span>`;
};

exports.message = (greeting, body) => `<div style="color: #04282e;
    font-family: proxima,Helvetica,Arial;
    background-color: #f7f7f7;
    max-width: 100%;
    margin: 0;
    padding: 0;">
    <div style="padding: 30px 0px; width: 100%; max-width: 420px;margin: auto;">
        <div style="width: 100%; max-width: 450px; display: flex; margin: auto;">
            <div style="width: 100%; min-height: 200px; box-sizing: border-box; height: 100%; background-color: white; margin: 20px 0px 10px; padding: 50px 20px;">
                <img style="max-width: 120px;
                max-height: 100px;
                object-fit: contain;
                display: flex;
                margin-bottom: 30px;" src="https://d20fux0pxzujdi.cloudfront.net/vendgram-logo.svg" alt="Vemdgram-Logo"/>
                <div style="padding-left: 10px;">
                    <div>
                        ${greeting}
                        ${body?.map((txt) => txt).join("")}
                    </div>
                    <div style="color: rgb(4, 40, 46); margin-top: 35px; line-height: 150%;">
                        <p style="color: rgb(4, 40, 46); font-size: small; font-family: proxima, Helvetica, Arial; margin-top: 20px; line-height: 150%; font-weight: 600;">
                        Made by Vendgram Inc <br/>                   
                        </p>
                    </div>
                </div>
                <div style="color:#04282e;height:1px;width:100%;background-color:#dfdfdf;margin:30px 0"></div>
                <p style="color:#959595;font-family:proxima,Helvetica,Arial;font-size:16px;font-weight:600;line-height:28px;text-align:center;margin:0px 0px 5px" align="center">
                    Need help, or have questions?
                </p>
                <div style="color:#04282e;height:1px;width:100%;background-color:#dfdfdf;margin:30px 0"></div>
                <div style="color:#04282e;display:flex; gap: 14px;">
                    <a style="display:inline-block;color:#6899ee;text-decoration:none;font-family:proxima,Helvetica,Arial;margin:0 0px 0 0;padding:0">
                        <img width="28" height="28" alt="img" />
                        fb
                    </a>
                    <a style="display:inline-block;color:#6899ee;text-decoration:none;font-family:proxima,Helvetica,Arial;margin:0;padding:0">
                        <img width="28" height="28" alt="img" />
                        fb
                    </a>
                </div>
                <p style="color:#666666;font-family:proxima,Helvetica,Arial;text-decoration:none;font-weight:600;font-size:12px;text-align:center;margin:30px 0px;padding:0">&copy; 2023 Vendgram Inc. All rights reserved.</p>
            </div>
        </div>
    </div>
</div>`;
