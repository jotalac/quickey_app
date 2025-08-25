import nodemailer, { SendMailOptions, Transporter, TransportOptions } from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
    to: string,
    subject: string,
    template?: string,
    data?: Record<string, any>,
    html?: string
}

class EmailService {
    private transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,   
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })
    }

    private generateEmailHtml(templateName: string, data: Record<string, any>): string {
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'emails', `${templateName}.html`);
        let emailTemplate = fs.readFileSync(templatePath, 'utf-8')

        //replate place holders with actuall data
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            emailTemplate = emailTemplate.replace(regex, data[key]);
        })

        return emailTemplate
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions: SendMailOptions = {
                from: process.env.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                //get html from options or parse it from file 
                html: options.html || this.generateEmailHtml(options.template!, options.data!),
                attachments: [
                     {
                        filename: 'main-logo.svg',
                        path: path.join(process.cwd(), 'public', 'images', 'icons', 'main-logo.png'),
                        cid: 'logoImage'
                     }
                ]
            }

            await this.transporter.sendMail(mailOptions)

            return true

        } catch (error) {
            console.log(error)
            return false
        }
    }

    async sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<boolean> {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/register-verify?token=${verificationToken}`
    
            const mailOptions: EmailOptions = {
                to: email,
                subject: 'Quickey email verification',
                template: 'email_verify',
                data: {
                    'username': username,
                    'url': verificationUrl,
                    'email': email
                }
            }
    
            await this.sendEmail(mailOptions)

            return true 
        } catch (error) {
            console.log(error);
            return false
        }
    }

    async sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<boolean> {
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/change-password?token=${resetToken}`

            const mailOptions: EmailOptions = {
                to: email,
                subject: 'Quickey password reset request',
                template: 'password_reset',
                data: {
                    'username': username,
                    'resetUrl': resetUrl,
                    'email': email
                }
            }

            await this.sendEmail(mailOptions)
            return true 
        } catch (error) {
            console.log(error);
            return false
        } 
    }

}

export default new EmailService();