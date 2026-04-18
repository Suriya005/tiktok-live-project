# 📋 Product Requirements Document

**TikTok Live Interactive Quiz**  
**Version:** 1.0 | **Date:** April 9, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Success Criteria](#success-criteria)

---

## Project Overview

### Purpose

TikTok Live Interactive Quiz คือระบบ Quiz แบบ Real-time สำหรับ TikTok Live ที่ช่วยให้:

- 👤 **Streamer** สามารถสร้างและจัดการ Quiz ระหว่าง Live ได้
- 👥 **Viewers** ตอบคำถามผ่าน Comment ได้ทันที
- 🏆 **Community** มีความสนุกและมีส่วนร่วมมากขึ้น

### Scope

✅ ระบบสร้างและจัดการ Quiz สำหรับ Streamer  
✅ การรับ Comment จาก TikTok Live แบบ Real-time  
✅ การประมวลผลคำตอบและแสดงผลคะแนน  
✅ Leaderboard แสดงผลผู้ชนะ  
✅ Dashboard สำหรับ Streamer ควบคุม Quiz  

### Out of Scope

❌ ระบบ Payment / รางวัลเงินสด (Phase 2)  
❌ Mobile Application (Phase 2)  
❌ Platform อื่นนอกจาก TikTok  

---

## User Personas

### 1. Streamer (Host)

**Profile:**
- วัยทำงาน 18-40 ปี
- ทำ TikTok Live อย่างสม่ำเสมอ
- ต้องการเพิ่ม Engagement

**Goals:**
- ✅ สร้าง Quiz ได้ง่าย
- ✅ ควบคุม Quiz แบบ Real-time
- ✅ เห็นสถิติผู้ชม
- ✅ Leaderboard ชัดเจน

**Pain Points:**
- ❌ ไม่ต้องการ Setup ซับซ้อน
- ❌ ต้องการ UI สวยและเข้าใจง่าย
- ❌ ต้องการ Support ดี

### 2. Viewer (ผู้ชม)

**Profile:**
- Follower ของ Streamer
- มี Smartphone + TikTok Account
- ต้องการส่วนร่วมในการ Live

**Goals:**
- ✅ ตอบ Quiz ได้ง่าย
- ✅ เห็นคะแนนของตัวเอง
- ✅ เห็น Leaderboard

**Pain Points:**
- ❌ ไม่ต้องติดตั้งแอปเพิ่มเติม
- ❌ ต้องการ UX ที่ชัดเจน

---

## Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-----------|---------|----|
| FR-01 | Streamer สร้าง Quiz ก่อน Live | Must | Dashboard Feature |
| FR-02 | Multiple Choice Questions | Must | 4 ตัวเลือก (A/B/C/D) |
| FR-03 | Real-time Comment Monitor | Must | TikTok Integration |
| FR-04 | Answer Processing | Must | Auto-validate & Score |
| FR-05 | Leaderboard Display | Should | Real-time Update |
| FR-06 | Export Leaderboard | Nice | CSV Format |

---

## Non-Functional Requirements

| ID | Requirement | Metric |
|----|-----------|--------|
| NFR-01 | Response Time | < 500ms |
| NFR-02 | Uptime | 99.9% |
| NFR-03 | Concurrent Users | 10,000+ |
| NFR-04 | Data Security | JWT + HTTPS |
| NFR-05 | UI Responsiveness | < 100ms |

---

## Success Criteria

✅ 100% Quiz สร้างได้สำเร็จ  
✅ 95%+ Answer Processing Accuracy  
✅ < 500ms Leaderboard Update  
✅ 4.5+ ⭐ User Satisfaction  
✅ Zero Data Loss  

---

**Last Updated:** April 9, 2026  
**Status:** Draft  
**Next Review:** May 9, 2026
