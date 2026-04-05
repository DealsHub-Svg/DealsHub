import ngrok from 'ngrok';
import fs from 'fs';

const start = async () => {
    try {
        // Force cleanup before starting
        await ngrok.kill().catch(() => {}); 
        
        const url = await ngrok.connect({
            addr: 5001,
            authtoken: '3BoZilqyZybn56OKF4K9dHrbUoM_7qa74ZBUH35ojou2eehi1'
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
