const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export { cn };