import https from 'https';

/**
 * Sends a WhatsApp message via the configured gateway or logs a simulation if none is configured.
 * @param {Object} store - The store document containing gateway credentials
 * @param {string} to - Recipient phone number
 * @param {string} body - Message text body
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWhatsAppMessage = async (store, to, body) => {
  // Clean phone number (remove non-digits)
  let cleanPhone = to.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India prefix if 10 digits
  }

  const { whatsappGatewayProvider, whatsappGatewayInstanceId, whatsappGatewayToken } = store;

  if (whatsappGatewayProvider === 'ultramsg' && whatsappGatewayInstanceId && whatsappGatewayToken) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        token: whatsappGatewayToken,
        to: cleanPhone,
        body: body
      });

      const options = {
        hostname: 'api.ultramsg.com',
        port: 443,
        path: `/${whatsappGatewayInstanceId}/messages/chat`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.sent === 'true' || parsed.success || parsed.id) {
              resolve({ success: true, messageId: parsed.id });
            } else {
              resolve({ success: false, error: parsed.error || 'Failed sending via Ultramsg' });
            }
          } catch (e) {
            resolve({ success: false, error: 'Invalid response from Ultramsg API' });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Ultramsg Gateway Request Error:', error);
        resolve({ success: false, error: error.message });
      });

      req.write(postData);
      req.end();
    });
  }

  // Fallback to simulation
  console.log(`[SIMULATED WhatsApp Gateway]: Sent to ${cleanPhone}: "${body}"`);
  return { success: true, messageId: 'simulated_' + Math.random().toString(36).substr(2, 9) };
};
