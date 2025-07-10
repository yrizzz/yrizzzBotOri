import os from 'os';
import si from 'systeminformation';

const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d} day${d > 1 ? 's' : ''}, ${h} hours, ${m} minutes, ${s} seconds`;
};

const botStartTime = Date.now();

export default {
    name: 'ping',
    type: 'command',
    code: async (ctx) => {
        const start = Date.now();

        const [
            cpu,
            mem,
            osInfo,
            disk,
            net,
            virt,
        ] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo(),
            si.fsSize(),
            si.networkInterfaces(),
            si.system(),
            si.currentLoad(),
            si.networkStats()
        ]);

        const latency = (Date.now() - start).toFixed(2);
        const platform = os.platform();
        const arch = os.arch();
        const release = os.release();
        const uptime = formatUptime(os.uptime());
        const botUptime = formatUptime((Date.now() - botStartTime) / 1000);

        const nodeStats = process.memoryUsage();
        const [load1, load5, load15] = os.loadavg();
        const message = `
*INFO SERVER*
- Speed Respons: ${latency} Milisecond(s)
- CPU Model: ${cpu.manufacturer} ${cpu.brand}
- CPU Core: ${cpu.cores}
- Platform : ${platform}
- OS : ${osInfo.build} / ${release}
- Kernel Arch: ${arch}
- Virtualization: ${virt.virtualization || 'Unknown'}
- Ram: ${formatBytes(mem.active)} / ${formatBytes(mem.total)}
- Swap: ${formatBytes(mem.swaptotal)} / ${formatBytes(mem.swaptotal)}
- Load Average: ${load1.toFixed(2)}, ${load5.toFixed(2)}, ${load15.toFixed(2)}
- Disk: ${disk[0] ? `${formatBytes(disk[0].used)} / ${formatBytes(disk[0].size)}` : 'Unknown'}

*PROVIDER INFO*
- IP: ${net[0]?.ip4 || 'Unknown'}
- Region: ${osInfo.codename || 'Unknown'}
- ISP: ${net[0]?.ifaceName || 'Unknown'}

*RUNTIME OS*
- ${uptime}

*RUNTIME BOT*
- ${botUptime}

*NODEJS STATISTICS*
- RSS Memory Usage: ${formatBytes(nodeStats.rss)}
- Heap Total: ${formatBytes(nodeStats.heapTotal)}
- Heap Used: ${formatBytes(nodeStats.heapUsed)}
- External Memory: ${formatBytes(nodeStats.external)}
        `.trim();

        ctx.reply(message);
    }
};
