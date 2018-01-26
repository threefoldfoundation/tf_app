export function getStepTitle(stepId: string): string {
  return stepId.replace('message_', '').replace('_', ' ');
}
