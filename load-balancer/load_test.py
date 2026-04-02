#!/usr/bin/env python3
"""
load_test.py — END-TO-END Load tester for the GP Quiz Platform.

Tests the FULL pipeline: queueing AND Judge0 execution.
1. Connects via Socket.io
2. Joins the user room
3. POSTs to /submit
4. Waits for the 'submission_result' event back from Judge0.

Requirements:
    pip install "python-socketio[asyncio]" aiohttp
"""

import asyncio
import aiohttp
import socketio
import argparse
import time
import statistics
import sys
import uuid

# ─── DEFAULT CONFIG ──────────────────────────────────────────────────────────

DEFAULT_URL   = "http://localhost:3100"
DEFAULT_USERS = 5         # reduced default because E2E tests are heavier
DEFAULT_WAVES = 1
WAVE_PAUSE    = 2.0

PAYLOAD_TEMPLATE = {
    "user_id":     "{uid}",
    "source_code": '''
import time
time.sleep(4)
print("load_test_ok")
''',
    "language_id": 71,
    "problem_id":  "1",
    "stdin":       "",
    "mode":        "run"
}

# ─── CORE ────────────────────────────────────────────────────────────────────

async def run_user_e2e(session: aiohttp.ClientSession, url: str, user_index: int) -> dict:
    uid = f"testuser_{user_index}_{uuid.uuid4().hex[:6]}"
    
    # 1. Initialize socket.io client
    sio = socketio.AsyncClient(logger=False, engineio_logger=False)
    result_future = asyncio.Future()

    @sio.on('submission_result')
    async def on_result(data):
        if not result_future.done():
            result_future.set_result(data)

    t0 = time.perf_counter()
    try:
        # 2. Connect and join room
        await sio.connect(url, transports=['websocket', 'polling'])
        await sio.emit('join_user', uid)
        
        # 3. Post submission
        payload = {**PAYLOAD_TEMPLATE, "user_id": uid}
        async with session.post(f"{url}/submit", json=payload, timeout=aiohttp.ClientTimeout(total=5)) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise Exception(f"HTTP {resp.status} on submit: {text[:50]}")
        
        # 4. Wait for Judge0 execution result via socket
        # Timeout after 60s in case Judge0 hangs
        data = await asyncio.wait_for(result_future, timeout=60.0)
        
        elapsed = time.perf_counter() - t0
        await sio.disconnect()
        
        return {
            "ok": True, 
            "latency": elapsed, 
            "status": data.get("status"),
            "stdout": data.get("stdout", "").strip()
        }
    
    except asyncio.TimeoutError:
        if sio.connected:
            await sio.disconnect()
        return {"ok": False, "latency": time.perf_counter() - t0, "error": "Execution Timeout (>60s)"}
    except Exception as e:
        if sio.connected:
            await sio.disconnect()
        return {"ok": False, "latency": time.perf_counter() - t0, "error": str(e)}


async def run_wave(url: str, n: int, wave_num: int, offset: int = 0) -> list:
    print(f"\n  ⚡ Wave {wave_num}: firing {n} END-TO-END concurrent submissions...")
    t_wave = time.perf_counter()
    
    # We use a single ClientSession for HTTP calls in this wave
    async with aiohttp.ClientSession() as session:
        tasks = [run_user_e2e(session, url, offset + i) for i in range(n)]
        results = await asyncio.gather(*tasks)
        
    wave_time = time.perf_counter() - t_wave
    print(f"  ✅ Wave {wave_num} completed in {wave_time:.2f}s")
    return results


def print_report(all_results: list, total_elapsed: float, users: int, waves: int):
    ok      = [r for r in all_results if r["ok"]]
    failed  = [r for r in all_results if not r["ok"]]
    latencies = [r["latency"] for r in ok]

    print("\n" + "═" * 55)
    print("  📊  END-TO-END LOAD TEST REPORT")
    print("═" * 55)
    print(f"  Total requests   : {len(all_results)}  ({users} users × {waves} wave(s))")
    print(f"  Successful       : {len(ok)}")
    print(f"  Failed           : {len(failed)}")
    print(f"  Total wall time  : {total_elapsed:.2f}s")

    if latencies:
        print(f"\n  ── End-to-End Latency (Submit → Queue → Judge0 → Socket) ──")
        print(f"  Min    : {min(latencies):.2f} s")
        print(f"  Max    : {max(latencies):.2f} s")
        print(f"  Mean   : {statistics.mean(latencies):.2f} s")
        print(f"  Median : {statistics.median(latencies):.2f} s")
        if len(latencies) > 1:
            print(f"  P95    : {sorted(latencies)[int(len(latencies)*0.95)]:.2f} s")
            
        print("\n  ── Outputs Received ─────────────────────────────")
        # Just show the first one to prove it worked
        print(f"  Sample output: '{ok[0]['stdout']}' (Judge Status: {ok[0]['status']})")

    if failed:
        print(f"\n  ── Failures ─────────────────────────────────────")
        for r in failed[:10]:
            print(f"  ✗ {r['error']}")
        if len(failed) > 10:
            print(f"  ... and {len(failed) - 10} more")

    print("═" * 55)

# ─── ENTRY POINT ─────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="End-to-End Load test")
    parser.add_argument("--url",   default=DEFAULT_URL,   help="Base URL of server.js")
    parser.add_argument("--users", type=int, default=DEFAULT_USERS, help="Concurrent submissions per wave")
    parser.add_argument("--waves", type=int, default=DEFAULT_WAVES, help="Number of bursts")
    args = parser.parse_args()

    print(f"\n🔧  GP Quiz Platform — END-TO-END Load Tester")
    print(f"    Target  : {args.url}")
    print(f"    Users   : {args.users} per wave")
    print(f"    Waves   : {args.waves}")

    all_results = []
    t_start = time.perf_counter()

    for w in range(1, args.waves + 1):
        offset = (w - 1) * args.users
        results = await run_wave(args.url, args.users, w, offset)
        all_results.extend(results)
        if w < args.waves:
            print(f"  ⏳ Waiting {WAVE_PAUSE}s before next wave...")
            await asyncio.sleep(WAVE_PAUSE)

    total_elapsed = time.perf_counter() - t_start
    print_report(all_results, total_elapsed, args.users, args.waves)

if __name__ == "__main__":
    # Workaround for Python 3.8+ Windows asyncio issue, harmless on Linux
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
