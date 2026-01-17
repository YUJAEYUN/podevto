#!/usr/bin/env python3
"""
패킷 계층별 분석 스크립트
설치: pip install scapy
실행: sudo python3 packet-analyzer.py
"""

from scapy.all import *

def analyze_packet(packet):
    print("\n" + "="*60)
    print("패킷 계층 구조:")
    print("="*60)

    # 계층별로 출력
    layer_num = 1
    current_layer = packet

    while current_layer:
        layer_name = current_layer.__class__.__name__
        print(f"\n[계층 {layer_num}: {layer_name}]")

        # Ethernet 계층
        if layer_name == "Ether":
            print(f"  ├─ Destination MAC: {current_layer.dst}")
            print(f"  ├─ Source MAC: {current_layer.src}")
            print(f"  └─ Type: 0x{current_layer.type:04x}")

        # IP 계층
        elif layer_name == "IP":
            print(f"  ├─ Version: {current_layer.version}")
            print(f"  ├─ Header Length: {current_layer.ihl * 4} bytes")
            print(f"  ├─ Total Length: {current_layer.len} bytes")
            print(f"  ├─ Protocol: {current_layer.proto}")
            print(f"  ├─ Source IP: {current_layer.src}")
            print(f"  └─ Destination IP: {current_layer.dst}")

        # TCP 계층
        elif layer_name == "TCP":
            flags = []
            if current_layer.flags.S: flags.append("SYN")
            if current_layer.flags.A: flags.append("ACK")
            if current_layer.flags.F: flags.append("FIN")
            if current_layer.flags.P: flags.append("PSH")
            if current_layer.flags.R: flags.append("RST")

            print(f"  ├─ Source Port: {current_layer.sport}")
            print(f"  ├─ Dest Port: {current_layer.dport}")
            print(f"  ├─ Seq Number: {current_layer.seq}")
            print(f"  ├─ Ack Number: {current_layer.ack}")
            print(f"  └─ Flags: {' '.join(flags)}")

        # HTTP/Application 데이터
        elif layer_name == "Raw":
            data = bytes(current_layer)
            print(f"  └─ Data ({len(data)} bytes):")
            # 처음 100바이트만 출력
            if len(data) > 0:
                try:
                    # ASCII로 출력 시도
                    text = data[:100].decode('utf-8', errors='ignore')
                    print(f"     {repr(text)}")
                except:
                    # 16진수로 출력
                    print(f"     {data[:100].hex()}")

        # 다음 계층으로
        current_layer = current_layer.payload if current_layer.payload else None
        layer_num += 1

    print("\n" + "="*60)

def main():
    print("패킷 캡처 시작...")
    print("HTTP 요청을 보내면 계층별 헤더를 확인할 수 있습니다.")
    print("예: 다른 터미널에서 'curl http://example.com' 실행")
    print("\nCtrl+C로 종료\n")

    # 포트 80(HTTP) 패킷만 캡처
    try:
        sniff(filter="tcp port 80", prn=analyze_packet, count=5)
    except PermissionError:
        print("\n에러: root 권한이 필요합니다!")
        print("다시 실행: sudo python3 packet-analyzer.py")

if __name__ == "__main__":
    main()
