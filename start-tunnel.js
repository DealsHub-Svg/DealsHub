import 'dotenv/config';
import ngrok from 'ngrok';
import fs from 'fs';

const start = async () => {
    try {
        const authtoken = process.env.NGROK_AUTHTOKEN;
        if (!authtoken) {
            console.error(
                'Missing NGROK_AUTHTOKEN. Add it to .env (see https://dashboard.ngrok.com/get-started/your-authtoken )'
            );
            process.exit(1);
        }

        // Force cleanup before starting
        await ngrok.kill().catch(() => {});

        const url = await ngrok.connect({
            addr: 5001,
            authtoken,
        });
        console.log(`URL: ${url}`);
        fs.writeFileSync('ngrok_url.txt', url);
        
        // Keep process open
        process.stdin.resume();
    } catch (err) {
        console.error("Ngrok failed:", err);
        process.exit(1);
    }
};

start();
