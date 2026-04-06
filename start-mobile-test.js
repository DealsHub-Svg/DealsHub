import 'dotenv/config';
import ngrok from 'ngrok';
import fs from 'fs';
import { spawn } from 'child_process';

const start = async () => {
    try {
        const authtoken = process.env.NGROK_AUTHTOKEN;
        if (!authtoken) {
            console.error(
                'Missing NGROK_AUTHTOKEN. Add it to .env (see https://dashboard.ngrok.com/get-started/your-authtoken )'
            );
            process.exit(1);
        }

        // 1. Start Backend Server (Port 5001)
        console.log("Starting backend server...");
        const server = spawn('node', ['server.js'], { stdio: 'inherit' });

        // 2. Start Frontend Vite Server (Port 5173)
        console.log("Starting frontend server...");
        const vite = spawn('npx', ['vite', '--host', '--port', '5173', '--strictPort'], {
            stdio: 'inherit',
        });

        // 3. Start Ngrok Tunnel for Frontend (Port 5173)
        console.log("Starting ngrok tunnel for frontend...");
        await ngrok.kill().catch(() => {});

        const url = await ngrok.connect({
            addr: 5173,
            authtoken,
            domain: 'comeatable-tobi-bolometrically.ngrok-free.dev'
        });

        console.log(`\n🚀 MOBILE TEST LINK: ${url}\n`);
        console.log('Update mobile/constants/Config.ts API_BASE to this URL for the Expo app.\n');
        fs.writeFileSync('ngrok_url.txt', url);
        
        // Keep processes alive
        process.on('SIGINT', () => {
            server.kill();
            vite.kill();
            process.exit();
        });

    } catch (err) {
        console.error("Failed to start testing environment:", err);
        process.exit(1);
    }
};

start();
