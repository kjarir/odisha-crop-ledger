// Certificate generation utility for AgriTrace
export const generateCertificate = async (batchData: any) => {
  // Create a simple HTML certificate
  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>AgriTrace Certificate</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          background: #f9f9f9;
        }
        .certificate {
          background: white;
          padding: 40px;
          border: 3px solid #2d5a2d;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2d5a2d;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2d5a2d;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #2d5a2d;
          margin: 20px 0;
        }
        .content {
          line-height: 1.8;
        }
        .field {
          margin: 15px 0;
        }
        .label {
          font-weight: bold;
          color: #2d5a2d;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="logo">🌿 AgriTrace</div>
          <div>Government of Odisha</div>
          <div class="title">Certificate of Agricultural Traceability</div>
        </div>
        
        <div class="content">
          <div class="field">
            <span class="label">Batch ID:</span> ${batchData.id}
          </div>
          <div class="field">
            <span class="label">Crop Type:</span> ${batchData.crop_type}
          </div>
          <div class="field">
            <span class="label">Variety:</span> ${batchData.variety}
          </div>
          <div class="field">
            <span class="label">Harvest Quantity:</span> ${batchData.harvest_quantity} kg
          </div>
          <div class="field">
            <span class="label">Sowing Date:</span> ${new Date(batchData.sowing_date).toLocaleDateString()}
          </div>
          <div class="field">
            <span class="label">Harvest Date:</span> ${new Date(batchData.harvest_date).toLocaleDateString()}
          </div>
          <div class="field">
            <span class="label">Quality Score:</span> ${batchData.quality_score}/100
          </div>
          <div class="field">
            <span class="label">Grading:</span> ${batchData.grading}
          </div>
          <div class="field">
            <span class="label">Certification:</span> ${batchData.certification || 'Standard'}
          </div>
          <div class="field">
            <span class="label">Status:</span> ${batchData.status}
          </div>
        </div>
        
        <div class="footer">
          <div>Issued by Government of Odisha Agricultural Department</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
          <div>This certificate verifies the authenticity and traceability of the agricultural produce.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([certificateHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `AgriTrace_Certificate_${batchData.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const downloadPDFCertificate = (batchData: any) => {
  // For now, we'll generate an HTML certificate
  // In a real implementation, you'd use a PDF library like jsPDF or react-pdf
  generateCertificate(batchData);
};