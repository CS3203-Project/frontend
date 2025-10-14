import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	// Force white dots for now (always use 'dark' theme which renders white dots)
	// This ensures dots are always visible on dark backgrounds
	const [theme, setTheme] = useState<'light' | 'dark'>('dark');

	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		particles: THREE.Points[];
		animationId: number;
		count: number;
	} | null>(null);

	// Commented out theme detection - using forced white dots
	// useEffect(() => {
	// 	const checkTheme = () => {
	// 		const isDark = 
	// 			document.documentElement.classList.contains('dark') ||
	// 			document.body.classList.contains('dark') ||
	// 			window.matchMedia('(prefers-color-scheme: dark)').matches;
	// 		setTheme(isDark ? 'dark' : 'light');
	// 	};
	// 	checkTheme();
	// 	const observer = new MutationObserver(checkTheme);
	// 	observer.observe(document.documentElement, {
	// 		attributes: true,
	// 		attributeFilter: ['class'],
	// 	});
	// 	observer.observe(document.body, {
	// 		attributes: true,
	// 		attributeFilter: ['class'],
	// 	});
	// 	return () => observer.disconnect();
	// }, []);

	useEffect(() => {
		if (!containerRef.current) {
			console.error('DottedSurface: containerRef is null');
			return;
		}

		console.log('DottedSurface: Starting initialization with theme:', theme);

		const SEPARATION = 150;
		const AMOUNTX = 40;
		const AMOUNTY = 60;

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

		const camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 355, 1220);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(scene.fog.color, 0);

		// Make canvas fill container
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.display = 'block';
		renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.top = '0';
		renderer.domElement.style.left = '0';

		console.log('DottedSurface: Canvas created, appending to container');
		containerRef.current.appendChild(renderer.domElement);
		console.log('DottedSurface: Canvas appended, children count:', containerRef.current.children.length);

		// Create particles
		const particles: THREE.Points[] = [];
		const positions: number[] = [];
		const colors: number[] = [];

		// Create geometry for all particles
		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; // Will be animated
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				if (theme === 'dark') {
					// Bright white for dark mode (normalized to 0-1)
					colors.push(1.0, 1.0, 1.0);
				} else {
					// Black for light mode (normalized to 0-1)
					colors.push(0, 0, 0);
				}
			}
		}

		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// Create material
		const material = new THREE.PointsMaterial({
			size: 15,
			vertexColors: true,
			transparent: true,
			opacity: 0.8,
			sizeAttenuation: true,
		});

		// Create points object
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let count = 0;
		let animationId = 0;

		// Animation function
		const animate = () => {
			animationId = requestAnimationFrame(animate);

			const positionAttribute = geometry.attributes.position;
			const positions = positionAttribute.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;

					// Animate Y position with sine waves
					positions[index + 1] =
						Math.sin((ix + count) * 0.3) * 50 +
						Math.sin((iy + count) * 0.5) * 50;

					i++;
				}
			}

			positionAttribute.needsUpdate = true;

			renderer.render(scene, camera);
			count += 0.1;
		};

		// Handle window resize
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);

		// Store references before starting animation
		sceneRef.current = {
			scene,
			camera,
			renderer,
			particles: [points],
			animationId: 0,
			count: 0,
		};

		// Start animation
		console.log('DottedSurface: Starting animation loop');
		animate();
		console.log('DottedSurface: Animation loop started successfully');

		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);

			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);

				// Clean up Three.js objects
				sceneRef.current.scene.traverse((object) => {
					if (object instanceof THREE.Points) {
						object.geometry.dispose();
						if (Array.isArray(object.material)) {
							object.material.forEach((material) => material.dispose());
						} else {
							object.material.dispose();
						}
					}
				});

				sceneRef.current.renderer.dispose();

				if (containerRef.current && sceneRef.current.renderer.domElement) {
					containerRef.current.removeChild(
						sceneRef.current.renderer.domElement,
					);
				}
			}
		};
	}, [theme]);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none fixed inset-0 bg-transparent', className)}
			style={{ 
				zIndex: -10,
				width: '100vw',
				height: '100vh',
				position: 'fixed',
				top: 0,
				left: 0
			}}
			{...props}
		/>
	);
}
