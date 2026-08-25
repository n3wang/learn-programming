const PNG_LINE = /^PISTON_PNG:([A-Za-z0-9+/=\s]+)$/gm;

export default function splitChartOutput(text) {
    const images = [];
    const cleaned = String(text || '').replace(PNG_LINE, (_, b64) => {
        images.push(String(b64).replace(/\s/g, ''));
        return '[chart attached]';
    });
    return {text: cleaned, images};
}
