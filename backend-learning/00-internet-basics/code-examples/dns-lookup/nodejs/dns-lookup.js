/**
 * DNS 조회 예제
 *
 * 실행 방법:
 * node dns-lookup.js google.com
 */

const dns = require('dns');
const { promisify } = require('util');

// Promise 버전으로 변환
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveTxt = promisify(dns.resolveTxt);
const reverse = promisify(dns.reverse);

async function lookupDomain(domain) {
  console.log(`🔍 DNS 조회: ${domain}`);
  console.log('='.repeat(50));
  console.log('');

  try {
    // A 레코드 (IPv4)
    console.log('📍 A 레코드 (IPv4):');
    try {
      const addresses = await resolve4(domain);
      addresses.forEach(ip => {
        console.log(`  → ${ip}`);
      });
    } catch (error) {
      console.log('  (없음)');
    }
    console.log('');

    // AAAA 레코드 (IPv6)
    console.log('📍 AAAA 레코드 (IPv6):');
    try {
      const addresses = await resolve6(domain);
      addresses.forEach(ip => {
        console.log(`  → ${ip}`);
      });
    } catch (error) {
      console.log('  (없음)');
    }
    console.log('');

    // MX 레코드 (메일 서버)
    console.log('📧 MX 레코드 (메일 서버):');
    try {
      const mxRecords = await resolveMx(domain);
      mxRecords.sort((a, b) => a.priority - b.priority);
      mxRecords.forEach(mx => {
        console.log(`  → ${mx.exchange} (우선순위: ${mx.priority})`);
      });
    } catch (error) {
      console.log('  (없음)');
    }
    console.log('');

    // NS 레코드 (네임서버)
    console.log('🌐 NS 레코드 (네임서버):');
    try {
      const nameservers = await resolveNs(domain);
      nameservers.forEach(ns => {
        console.log(`  → ${ns}`);
      });
    } catch (error) {
      console.log('  (없음)');
    }
    console.log('');

    // TXT 레코드
    console.log('📝 TXT 레코드:');
    try {
      const txtRecords = await resolveTxt(domain);
      txtRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.join(' ')}`);
      });
    } catch (error) {
      console.log('  (없음)');
    }
    console.log('');

    // 역방향 조회 (IP → 도메인)
    if (addresses && addresses.length > 0) {
      console.log('🔄 역방향 조회 (IP → 도메인):');
      try {
        const hostnames = await reverse(addresses[0]);
        hostnames.forEach(hostname => {
          console.log(`  ${addresses[0]} → ${hostname}`);
        });
      } catch (error) {
        console.log(`  ${addresses[0]} → (역방향 레코드 없음)`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ DNS 조회 실패:', error.message);
  }
}

// 명령줄 인자에서 도메인 가져오기
const domain = process.argv[2];

if (!domain) {
  console.log('사용법: node dns-lookup.js <도메인>');
  console.log('');
  console.log('예시:');
  console.log('  node dns-lookup.js google.com');
  console.log('  node dns-lookup.js github.com');
  console.log('  node dns-lookup.js naver.com');
  process.exit(1);
}

// 실행
lookupDomain(domain);

// 추가 예제: 여러 도메인 조회
async function lookupMultipleDomains(domains) {
  for (const domain of domains) {
    await lookupDomain(domain);
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// 사용 예시 (주석 해제하여 사용)
// lookupMultipleDomains(['google.com', 'github.com', 'cloudflare.com']);
