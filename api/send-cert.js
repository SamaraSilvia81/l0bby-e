const nodemailer = require('nodemailer')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, studentName, eventTitle, eventDate, pdfBase64 } = req.body

  if (!email || !pdfBase64) return res.status(400).json({ error: 'Missing fields' })

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const filename = `certificado-${studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`

    await transporter.sendMail({
      from: `"L0bby-E · ETE Cícero Dias" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Seu certificado — ${eventTitle}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#fff;border-left:4px solid #8F00FF;">
          <h1 style="font-size:1.5rem;font-weight:900;margin-bottom:0.5rem;">
            l<span style="color:#8F00FF">0</span>bby<span style="color:#FF7927;font-size:0.6em">-E</span>
          </h1>
          <p style="color:#888;font-size:0.75rem;margin-bottom:2rem;">ETE Cícero Dias · Desenvolvimento de Sistemas</p>
          <p style="color:#aaa;font-size:0.85rem;margin-bottom:0.5rem;">// certificado_digital</p>
          <h2 style="font-size:1.8rem;font-weight:900;color:#fff;margin-bottom:0.25rem;">${studentName.toUpperCase()}</h2>
          <p style="color:#aaa;font-size:0.85rem;margin-bottom:2rem;">
            participou e concluiu com presença confirmada o evento<br/>
            <strong style="color:#8F00FF;font-size:1rem;">${eventTitle}</strong><br/>
            <span style="color:#888;">${eventDate || ''}</span>
          </p>
          <p style="color:#aaa;font-size:0.85rem;">O certificado em PDF está anexo a este email.</p>
          <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #222;color:#555;font-size:0.65rem;">
            l0bby-e · ETE Cícero Dias · Recife, PE
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBase64, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Erro email:', err.message)
    return res.status(500).json({ error: err.message })
  }
}

module.exports.config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}