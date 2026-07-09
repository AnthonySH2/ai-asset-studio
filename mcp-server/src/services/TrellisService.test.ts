import { TrellisService } from './TrellisService';
import { AssetGenerationRequest } from '../shared/interfaces/AssetInterfaces';

async function testTrellisService() {
  console.log('Testing TrellisService...');
  
  const trellisService = new TrellisService();
  
  // Test load method
  console.log('\n1. Testing load() method...');
  const loadResult = await trellisService.load();
  console.log(`Load result: ${loadResult}`);
  console.log(`Is loaded: ${trellisService['isLoaded']}`);
  
  // Test generateGLB method
  console.log('\n2. Testing generateGLB() method...');
  const mockRequest: AssetGenerationRequest = {
    prompt: 'A futuristic robot in a cityscape',
    iterations: 1,
    style: 'cyberpunk',
    resolution: '2048x2048'
  };
  
  try {
    const result = await trellisService.generateGLB(mockRequest);
    console.log('GLB generation result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error in generateGLB:', error);
  }
  
  // Test unload method
  console.log('\n3. Testing unload() method...');
  const unloadResult = await trellisService.unload();
  console.log(`Unload result: ${unloadResult}`);
  console.log(`Is loaded: ${trellisService['isLoaded']}`);
  
  // Test generateGLB when not loaded (should fail)
  console.log('\n4. Testing generateGLB() when not loaded...');
  try {
    const result = await trellisService.generateGLB(mockRequest);
    console.log('GLB generation result when not loaded:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error in generateGLB when not loaded:', error);
  }
  
  console.log('\nTesting complete!');
}

// Run the test
testTrellisService().catch(console.error);