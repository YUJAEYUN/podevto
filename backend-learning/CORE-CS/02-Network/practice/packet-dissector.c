/**
 * 패킷 계층별 헤더 분석 예제
 * 컴파일: gcc -o packet-dissector packet-dissector.c
 * 실행: sudo ./packet-dissector
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <net/ethernet.h>
#include <netinet/ip.h>
#include <netinet/tcp.h>
#include <unistd.h>

void print_ethernet_header(unsigned char* buffer) {
    struct ether_header *eth = (struct ether_header *)buffer;
    printf("\n[Ethernet Header]\n");
    printf("  |-Destination MAC : %.2X-%.2X-%.2X-%.2X-%.2X-%.2X\n",
        eth->ether_dhost[0], eth->ether_dhost[1], eth->ether_dhost[2],
        eth->ether_dhost[3], eth->ether_dhost[4], eth->ether_dhost[5]);
    printf("  |-Source MAC      : %.2X-%.2X-%.2X-%.2X-%.2X-%.2X\n",
        eth->ether_shost[0], eth->ether_shost[1], eth->ether_shost[2],
        eth->ether_shost[3], eth->ether_shost[4], eth->ether_shost[5]);
    printf("  |-Type            : 0x%.4x\n", ntohs(eth->ether_type));
}

void print_ip_header(unsigned char* buffer) {
    struct iphdr *iph = (struct iphdr*)(buffer + sizeof(struct ether_header));
    struct sockaddr_in source, dest;

    memset(&source, 0, sizeof(source));
    source.sin_addr.s_addr = iph->saddr;

    memset(&dest, 0, sizeof(dest));
    dest.sin_addr.s_addr = iph->daddr;

    printf("\n[IP Header]\n");
    printf("  |-Version         : %d\n", (unsigned int)iph->version);
    printf("  |-Header Length   : %d DWORDS (%d Bytes)\n",
        (unsigned int)iph->ihl, ((unsigned int)(iph->ihl))*4);
    printf("  |-Total Length    : %d Bytes\n", ntohs(iph->tot_len));
    printf("  |-TTL             : %d\n", (unsigned int)iph->ttl);
    printf("  |-Protocol        : %d\n", (unsigned int)iph->protocol);
    printf("  |-Source IP       : %s\n", inet_ntoa(source.sin_addr));
    printf("  |-Destination IP  : %s\n", inet_ntoa(dest.sin_addr));
}

void print_tcp_header(unsigned char* buffer) {
    struct iphdr *iph = (struct iphdr*)(buffer + sizeof(struct ether_header));
    unsigned int iphdrlen = iph->ihl * 4;
    struct tcphdr *tcph = (struct tcphdr*)(buffer + iphdrlen + sizeof(struct ether_header));

    printf("\n[TCP Header]\n");
    printf("  |-Source Port     : %u\n", ntohs(tcph->th_sport));
    printf("  |-Dest Port       : %u\n", ntohs(tcph->th_dport));
    printf("  |-Sequence Number : %u\n", ntohl(tcph->th_seq));
    printf("  |-Ack Number      : %u\n", ntohl(tcph->th_ack));
    printf("  |-Header Length   : %d DWORDS (%d Bytes)\n",
        (unsigned int)tcph->th_off, (unsigned int)tcph->th_off * 4);
    printf("  |-Flags           : ");
    if(tcph->th_flags & TH_FIN) printf("FIN ");
    if(tcph->th_flags & TH_SYN) printf("SYN ");
    if(tcph->th_flags & TH_RST) printf("RST ");
    if(tcph->th_flags & TH_PUSH) printf("PSH ");
    if(tcph->th_flags & TH_ACK) printf("ACK ");
    if(tcph->th_flags & TH_URG) printf("URG ");
    printf("\n");
}

void print_data(unsigned char* buffer, int size) {
    printf("\n[Application Data]\n");
    for(int i = 0; i < size; i++) {
        if(i != 0 && i % 16 == 0)
            printf("\n");
        printf("%.2X ", buffer[i]);
    }
    printf("\n");
}

int main() {
    int sock_raw;
    int saddr_size, data_size;
    struct sockaddr saddr;
    unsigned char *buffer = (unsigned char *)malloc(65536);

    printf("패킷 캡처 시작...\n");
    printf("Ctrl+C로 종료하세요.\n\n");

    // Raw socket 생성 (모든 프로토콜 캡처)
    sock_raw = socket(AF_PACKET, SOCK_RAW, htons(ETH_P_ALL));
    if(sock_raw < 0) {
        perror("Socket Error");
        return 1;
    }

    while(1) {
        saddr_size = sizeof(saddr);
        data_size = recvfrom(sock_raw, buffer, 65536, 0, &saddr, (socklen_t*)&saddr_size);

        if(data_size < 0) {
            printf("패킷 수신 실패\n");
            return 1;
        }

        printf("\n========================================\n");
        printf("패킷 크기: %d bytes\n", data_size);

        // 각 계층별 헤더 출력
        print_ethernet_header(buffer);
        print_ip_header(buffer);

        struct iphdr *iph = (struct iphdr*)(buffer + sizeof(struct ether_header));
        if(iph->protocol == 6) { // TCP
            print_tcp_header(buffer);
        }

        printf("\n========================================\n");
    }

    close(sock_raw);
    return 0;
}
