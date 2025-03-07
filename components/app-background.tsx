'use client';

import React, { useRef, useEffect } from 'react';

const nodeDistance = 155;
const nodeDensity = 0.00005;

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    update: () => void;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

class NodeImpl implements Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    private canvasWidth: number;
    private canvasHeight: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    update(): void {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
    }
}

const calculateNodeCount = (width: number, height: number) => {
    return Math.floor(nodeDensity * width * height);
};

const AnimatedGraphBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const nodesRef = useRef<Node[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const nodeCount = calculateNodeCount(canvas.width, canvas.height);
            nodesRef.current = Array.from({ length: nodeCount }, () => new NodeImpl(canvas.width, canvas.height));
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodesRef.current.forEach(node => {
                node.update();
                node.draw(ctx);
            });

            ctx.beginPath();
            for (let i = 0; i < nodesRef.current.length; i++) {
                for (let j = i + 1; j < nodesRef.current.length; j++) {
                    const dx = nodesRef.current[i].x - nodesRef.current[j].x;
                    const dy = nodesRef.current[i].y - nodesRef.current[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < nodeDistance) {
                        ctx.moveTo(nodesRef.current[i].x, nodesRef.current[i].y);
                        ctx.lineTo(nodesRef.current[j].x, nodesRef.current[j].y);
                    }
                }
            }
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.stroke();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-10">
            <canvas
                ref={canvasRef}
                className="bg-white"
            />
        </div>
    );
};

export default AnimatedGraphBackground;