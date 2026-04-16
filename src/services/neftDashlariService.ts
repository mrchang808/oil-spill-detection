/**
 * Neft Dashlari — Browser-Side Refresh Service
 * ==============================================
 * Calls the Vite dev server API endpoint which runs the real
 * Node.js + Python pipeline (Sentinel Hub downloads + ResNet18 ML).
 */

interface PipelineResponse {
  success: boolean;
  count: number;
  output: string;
  error?: string;
}

/**
 * Trigger the Neft Dashlari pipeline via the server API.
 * The server runs the full pipeline: downloads SAR/Optical from Sentinel Hub,
 * runs ResNet18 classification, and upserts detections to Supabase.
 *
 * Returns the number of detections upserted.
 */
export async function refreshNeftDashlari(): Promise<number> {
  console.log('[Neft Dashlari] Triggering server-side pipeline...');

  const response = await fetch('/api/neft-dashlari', {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[Neft Dashlari] Pipeline failed:', text);
    throw new Error(`Pipeline returned ${response.status}`);
  }

  const result: PipelineResponse = await response.json();

  if (!result.success) {
    console.error('[Neft Dashlari] Pipeline error:', result.error);
    console.log('[Neft Dashlari] Output:', result.output);
    throw new Error(result.error || 'Pipeline failed');
  }

  console.log(`[Neft Dashlari] ✅ Pipeline done — ${result.count} detection(s) upserted.`);
  return result.count;
}
