import { type Transporter, createTransport } from "nodemailer"
import conf from "../../config/environment.js"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const mail = async (job: any) => {
    try {
        const { action, payload } = job.data || null

        let transporter: Transporter
        if (conf.mailer.defaults) {
            transporter = createTransport(conf.mailer.transport, conf.mailer.defaults)
        } else {
            transporter = createTransport(conf.mailer.transport)
        }

        // put your html template here, return as exported js string
        const t_otp = (otp: string) =>
            `
            <div style="text-align: center;">
                <h1>OTP Code</h1>
                <p>OTP code is: <strong>${otp}</strong></p>
            </div>
            `

        switch (action) {
            case "otp":
                transporter.sendMail({
                    to: payload.email,
                    subject: "OTP Code",
                    text: `OTP code is: ${payload.otp_code}`,
                    html: t_otp(payload.otp_code),
                })
                return `OTP Mail Sent for ${payload.email}`
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message)
        }
        throw new Error(String(err))
    }
}

export default mail
