const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = ({email,name}) =>{ 
    sgMail.send({
        to:email,
        from:'sanketkalawade@gmail.com',
        subject:`Welcome ${name}`,
        text: 'Thanks for joining to Task Manager App.' 
    })
}
const sendAccountRemovedMail = ({email,name}) =>{
    sgMail.send({
        to:email,
        from:'sanketkalawade@gmail.com',
        subject:'account cancelation',
        text:`Hello ${name}, please provide us feedback about what we can improve in our service?`
    })
}

module.exports = {
    sendWelcomeMail,
    sendAccountRemovedMail
}