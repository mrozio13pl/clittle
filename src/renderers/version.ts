import type { Cli } from '../cli';

export default function renderVersion(meta: Cli): void {
    console.log('v' + meta.version_);
}