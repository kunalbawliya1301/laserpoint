require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const multer     = require('multer');
const nodemailer = require('nodemailer');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(cors());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        const allowed = ['.pdf', '.ai', '.png', '.jpg', '.jpeg', '.svg', '.eps'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) { cb(null, true); }
        else { cb(new Error('File type not allowed: ' + ext)); }
    }
});

const transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

transporter.verify((error) => {
    if (error) { console.error('MAIL ERROR:', error.message); }
    else        { console.log('Mail server connected'); }
});

const pricing = {
    a4:    { label: 'A4 Sheet',           rate: 200, unit: 'sheets' },
    a3:    { label: 'A3 Sheet',           rate: 350, unit: 'sheets' },
    meter: { label: 'Meter-based (Roll)', rate: 550, unit: 'meters' }
};

const serviceLabels = {
    'dtf-stickers': 'UV DTF Stickers',
    'uv-printing': 'UV Printing (Direct to Substrate)',
    'acrylic-printing': 'Acrylic Printing',
    'laser-engraving': 'Laser Engraving & Marking'
};

app.post('/send-order', upload.single('designFile'), async (req, res) => {
    try {
        const { fullName, emailAddress, serviceType, orderType, quantity, notes } = req.body;
        const file = req.file;

        if (!fullName || !emailAddress || !serviceType || !quantity)
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        if (!file)
            return res.status(400).json({ success: false, message: 'Design file is required.' });

        const isDtf = serviceType === 'dtf-stickers';
        const serviceLabel = serviceLabels[serviceType] || serviceType;
        const order = isDtf ? (pricing[orderType] || { label: orderType, rate: 0, unit: '' }) : null;
        const total = isDtf ? parseInt(quantity) * order.rate : 0;
        const now   = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // Build HTML table rows for owner and customer emails dynamically
        let ownerRows = `
<tr><td>Customer</td><td>${fullName}</td></tr>
<tr><td>Email</td><td><a href="mailto:${emailAddress}">${emailAddress}</a></td></tr>
<tr><td>Service Type</td><td>${serviceLabel}</td></tr>
`;
        if (isDtf && order) {
            ownerRows += `
<tr><td>Format Sizing</td><td>${order.label}</td></tr>
<tr><td>Quantity</td><td>${quantity} ${order.unit}</td></tr>
<tr><td>Est. Price</td><td><span class="amount">Rs.${total}</span></td></tr>
`;
        } else {
            ownerRows += `
<tr><td>Quantity</td><td>${quantity} pieces</td></tr>
`;
        }
        ownerRows += `
<tr><td>Design File</td><td>${file.originalname} (${(file.size/1024).toFixed(1)} KB)</td></tr>
<tr><td>Notes</td><td>${notes || 'None'}</td></tr>
`;

        let customerRows = `
<tr><td>Service Type</td><td>${serviceLabel}</td></tr>
`;
        if (isDtf && order) {
            customerRows += `
<tr><td>Format Sizing</td><td>${order.label}</td></tr>
<tr><td>Quantity</td><td>${quantity} ${order.unit}</td></tr>
`;
        } else {
            customerRows += `
<tr><td>Quantity</td><td>${quantity} pieces</td></tr>
`;
        }
        customerRows += `
<tr><td>Design File</td><td>${file.originalname}</td></tr>
<tr><td>Notes</td><td>${notes || 'None'}</td></tr>
`;
        if (isDtf) {
            customerRows += `
<tr class="tr"><td>Est. Price</td><td>Rs.${total}</td></tr>
`;
        }

        const ownerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;background:#f4f6fa;margin:0}
.w{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)}
.h{background:linear-gradient(135deg,#0a0f1f,#141b2d);padding:32px 40px;text-align:center}
.h h1{color:#f5a623;font-size:24px;margin:0 0 4px}.h p{color:#b0c4de;font-size:13px;margin:0}
.b{padding:36px 40px}.badge{display:inline-block;background:#fff8eb;color:#f5a623;border:1px solid #fde68a;border-radius:60px;padding:4px 14px;font-size:12px;font-weight:600;text-transform:uppercase;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#2d3748}
td:first-child{font-weight:600;color:#0a0f1f;width:38%}.amount{font-size:22px;font-weight:800;color:#f5a623}
.footer{background:#f4f6fa;padding:20px 40px;text-align:center;font-size:12px;color:#8a9ab0}
.btn{display:inline-block;background:linear-gradient(135deg,#f5a623,#f7c35c);color:#0a0f1f;font-weight:700;padding:12px 28px;border-radius:60px;text-decoration:none;font-size:14px;margin-top:8px}
</style></head><body>
<div class="w"><div class="h"><h1>LaserPoint</h1><p>New Order — ${now} IST</p></div>
<div class="b"><span class="badge">New Order</span>
<table>
${ownerRows}
</table>
<p style="font-size:13px;color:#8a9ab0">Design file attached below.</p>
<a class="btn" href="mailto:${emailAddress}?subject=Re:%20Your%20LaserPoint%20Order">Reply to Customer</a>
</div><div class="footer">2026 Laser Point</div></div></body></html>`;

        const customerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:Arial,sans-serif;background:#f4f6fa;margin:0}
.w{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)}
.h{background:linear-gradient(135deg,#0a0f1f,#141b2d);padding:32px 40px;text-align:center}
.h h1{color:#f5a623;font-size:24px;margin:0 0 6px}.h p{color:#b0c4de;font-size:14px;margin:0}
.b{padding:36px 40px}.hero{font-size:18px;font-weight:600;color:#0a0f1f;margin-bottom:6px}
.sub{font-size:14px;color:#5a6a7a;margin-bottom:28px}
table{width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #eef0f4}
th{background:#f8f9fb;padding:10px 16px;font-size:12px;text-transform:uppercase;color:#8a9ab0;text-align:left}
td{padding:12px 16px;font-size:14px;color:#2d3748;border-top:1px solid #eef0f4}td:first-child{font-weight:600;color:#0a0f1f}
.tr td{background:#fff8eb}.tr td:last-child{color:#f5a623;font-weight:800;font-size:18px}
.note{background:#f0f9ff;border-left:3px solid #38bdf8;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#0c4a6e;margin-bottom:24px}
.footer{background:#f4f6fa;padding:20px 40px;text-align:center;font-size:12px;color:#8a9ab0}
</style></head><body>
<div class="w"><div class="h"><h1>LaserPoint</h1><p>Precision Printing &amp; Engraving</p></div>
<div class="b">
<p class="hero">Hi ${fullName}, your order is received!</p>
<p class="sub">Thank you for choosing Laser Point. Here is your order summary.</p>
<table>
<tr><th>Detail</th><th>Value</th></tr>
${customerRows}
</table>
<div class="note"><strong>What is next?</strong> Our team will review your design and confirm within a few hours.</div>
<p style="font-size:13px;color:#8a9ab0">Working hours: Mon-Sat, 9 AM - 7 PM IST</p>
</div><div class="footer">2026 Laser Point</div></div></body></html>`;

        await transporter.sendMail({
            from:    '"Laser Point Orders" <' + process.env.MAIL_USER + '>',
            to:      process.env.OWNER_EMAIL,
            replyTo: emailAddress,
            subject: `New Order: ${isDtf ? order.label : serviceLabel} x${quantity} from ${fullName}`,
            html:    ownerHtml,
            attachments: [{ filename: file.originalname, content: file.buffer, contentType: file.mimetype }]
        });

        await transporter.sendMail({
            from:    '"Laser Point" <' + process.env.MAIL_USER + '>',
            to:      emailAddress,
            subject: 'Order Received - Laser Point',
            html:    customerHtml
        });

        console.log('Emails sent to owner and customer: ' + emailAddress);
        res.json({ success: true, message: 'Thank you! We will get back to you within 24 hours.' });

    } catch (err) {
        console.error('Error sending mail:', err);
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
    }
});

app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ success: false, message: 'File too large. Max 20 MB.' });
    res.status(500).json({ success: false, message: err.message });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('Laser Point server at http://localhost:' + PORT);
    });
}

module.exports = app;
