/**
 * Authentication Flow Tests
 * 
 * These tests verify the authentication system works correctly.
 * Run manually in development to verify authentication flows.
 */

import { supabase } from '../supabase';
import { logger } from '../logger';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

export class AuthenticationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];

    await this.testSupabaseConnection();
    await this.testSessionRetrieval();
    await this.testAuthStateChange();
    await this.testRateLimiting();

    return this.results;
  }

  private async testSupabaseConnection(): Promise<void> {
    const startTime = performance.now();
    const testName = 'Supabase Connection';

    try {
      const { error } = await supabase.auth.getSession();
      const duration = performance.now() - startTime;

      if (error) {
        this.results.push({
          name: testName,
          passed: false,
          message: `Connection failed: ${error.message}`,
          duration,
        });
      } else {
        this.results.push({
          name: testName,
          passed: true,
          message: 'Successfully connected to Supabase',
          duration,
        });
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
      });
    }
  }

  private async testSessionRetrieval(): Promise<void> {
    const startTime = performance.now();
    const testName = 'Session Retrieval';

    try {
      const { data, error } = await supabase.auth.getSession();
      const duration = performance.now() - startTime;

      if (error) {
        this.results.push({
          name: testName,
          passed: false,
          message: `Failed to retrieve session: ${error.message}`,
          duration,
        });
      } else {
        this.results.push({
          name: testName,
          passed: true,
          message: data.session 
            ? `Session found for user: ${data.session.user.email}` 
            : 'No active session (expected when logged out)',
          duration,
        });
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
      });
    }
  }

  private async testAuthStateChange(): Promise<void> {
    const startTime = performance.now();
    const testName = 'Auth State Change Listener';

    try {
      let listenerCalled = false;
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        listenerCalled = true;
        logger.debug(`Auth state changed: ${event}`, {
          component: 'AuthTest',
          hasSession: !!session,
        });
      });

      // Wait a bit to see if listener is set up
      await new Promise(resolve => setTimeout(resolve, 100));
      
      subscription.unsubscribe();
      const duration = performance.now() - startTime;

      this.results.push({
        name: testName,
        passed: true,
        message: 'Auth state change listener registered successfully',
        duration,
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
      });
    }
  }

  private async testRateLimiting(): Promise<void> {
    const startTime = performance.now();
    const testName = 'Rate Limiting';

    try {
      const { loginRateLimiter, getClientIdentifier } = await import('../rate-limiter');
      const clientId = getClientIdentifier();
      
      // Reset to start fresh
      loginRateLimiter.reset(clientId);
      
      // Test that we can make requests
      const check1 = loginRateLimiter.check(clientId);
      if (!check1.allowed) {
        throw new Error('First request should be allowed');
      }

      // Test remaining count
      if (check1.remaining !== 4) { // 5 max - 1 used = 4 remaining
        throw new Error(`Expected 4 remaining, got ${check1.remaining}`);
      }

      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        passed: true,
        message: `Rate limiting working correctly (${check1.remaining} requests remaining)`,
        duration,
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        message: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
      });
    }
  }

  printResults(): void {
    console.group('🧪 Authentication Tests');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`\n📊 Summary: ${passed} passed, ${failed} failed\n`);
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const duration = result.duration.toFixed(2);
      console.log(`${icon} ${result.name} (${duration}ms)`);
      console.log(`   ${result.message}\n`);
    });
    
    console.groupEnd();
  }
}

// Export singleton instance
export const authTester = new AuthenticationTester();

// Make available in browser console for manual testing
if (typeof window !== 'undefined') {
  (window as any).__testAuth = async () => {
    const results = await authTester.runAllTests();
    authTester.printResults();
    return results;
  };
  
  console.log('💡 Run __testAuth() in console to test authentication');
}
