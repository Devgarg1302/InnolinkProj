import nodemailer from 'nodemailer';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Generic email sending function
export async function sendEmail({ to, subject, text, html }: { 
  to: string, 
  subject: string, 
  text: string, 
  html: string 
}) {
  try {
    const mailOptions = {
      from: `"Thapar Project Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

interface ProjectNotificationEmailProps {
    to: string;
    projectTitle: string;
    projectType: string;
    role: 'TEAM_LEAD' | 'MENTOR' | 'PROJECT_LEAD';
    status?: 'APPROVED' | 'REJECTED';
    createdBy?: string;
    comment?: string;
}

export async function sendProjectNotificationEmail({
    to,
    projectTitle,
    projectType,
    role,
    status,
    createdBy,
    comment
}: ProjectNotificationEmailProps) {
    const subject = status
        ? `Project ${status.toLowerCase()}: ${projectTitle}`
        : `New Project Assignment: ${projectTitle}`;

    const roleText = role === 'TEAM_LEAD' ? 'team lead' : role === 'MENTOR' ? 'mentor' : 'project lead';
    const statusText = status?.toLowerCase() || 'assigned';

    const body = status
        ? `Your project "${projectTitle}" has been ${statusText} by ${createdBy}.${
            comment ? `\n\nComment: ${comment}` : ''
          }`
        : `You have been assigned as the ${roleText} for the project "${projectTitle}" of type ${projectType}.`;

    try {
        await sendEmail({
            to,
            subject,
            text: body,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a56db;">Project Notification</h2>
                    <p>${body}</p>
                    <p style="margin-top: 20px; color: #6b7280;">
                        This is an automated notification from the Project Portal.
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Failed to send project notification email:', error);
        throw error;
    }
} 