#!/usr/bin/env python3
"""
Physics calculation & verification kernel for tiaotiao-physics-lab.
Provides exact piecewise kinematics, classic high-school physics model solvers,
and optional SymPy symbolic verification.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple
import math

try:
    import sympy as sp
    HAS_SYMPY = True
except ImportError:
    sp = None
    HAS_SYMPY = False


@dataclass
class MotionSegment:
    """One constant-acceleration motion segment."""
    t_start: float
    t_end: float
    x0: float
    v0: float
    a: float
    label: str = ""

    def eval_at(self, t: float) -> Tuple[float, float, float]:
        dt = max(0.0, min(t, self.t_end) - self.t_start)
        x = self.x0 + self.v0 * dt + 0.5 * self.a * dt * dt
        v = self.v0 + self.a * dt
        return x, v, self.a


class PiecewiseMotion:
    """Piecewise constant-acceleration motion model with exact evaluation."""

    def __init__(self) -> None:
        self.segments: List[MotionSegment] = []

    def add_segment(self, duration: float, a: float, label: str = "",
                    x0: Optional[float] = None, v0: Optional[float] = None) -> "PiecewiseMotion":
        if not self.segments:
            t_start = 0.0
            cur_x = 0.0 if x0 is None else x0
            cur_v = 0.0 if v0 is None else v0
        else:
            prev = self.segments[-1]
            t_start = prev.t_end
            px, pv, _ = prev.eval_at(prev.t_end)
            cur_x = px if x0 is None else x0
            cur_v = pv if v0 is None else v0
        self.segments.append(
            MotionSegment(t_start, t_start + duration, cur_x, cur_v, a, label)
        )
        return self

    @property
    def total_time(self) -> float:
        return self.segments[-1].t_end if self.segments else 0.0

    def eval_at(self, t: float) -> Dict[str, Any]:
        if not self.segments:
            return {"t": t, "x": 0.0, "v": 0.0, "a": 0.0, "label": ""}
        if t <= self.segments[0].t_start:
            seg = self.segments[0]
            x, v, a = seg.eval_at(seg.t_start)
            return {"t": t, "x": x, "v": v, "a": a, "label": seg.label}
        for seg in self.segments:
            if t <= seg.t_end + 1e-12:
                x, v, a = seg.eval_at(t)
                return {"t": t, "x": x, "v": v, "a": a, "label": seg.label}
        seg = self.segments[-1]
        x, v, a = seg.eval_at(seg.t_end)
        return {"t": t, "x": x, "v": v, "a": a, "label": seg.label}

    def sample(self, n_points: int = 200) -> List[Dict[str, Any]]:
        T = self.total_time
        if T <= 0 or n_points < 2:
            return []
        return [self.eval_at(T * i / (n_points - 1)) for i in range(n_points)]


def solve_board_block(
    m_block: float,
    m_board: float,
    v0_block: float,
    mu1: float,
    mu2: float,
    board_length: float,
    g: float = 10.0,
) -> Dict[str, Any]:
    """
    Classic board-block model: block slides onto stationary board on horizontal ground.
    Follows Tiaotiao's 2-step method (Bixiu 1 Lesson 72-73):
    Step 1: Friction forces f1 = mu1*m_block*g, f2_max = mu2*(m_block+m_board)*g.
    Step 2: Accelerations a_block, a_board, and check whether they reach common velocity
            before relative displacement exceeds board_length.
    """
    f1 = mu1 * m_block * g
    f2_max = mu2 * (m_block + m_board) * g
    a_block = -f1 / m_block  # decelerates

    if f1 <= f2_max + 1e-12:
        a_board = 0.0
        board_moves = False
    else:
        a_board = (f1 - f2_max) / m_board
        board_moves = True

    # Time to common velocity (if no separation): v0_block + a_block*t = a_board*t
    t_common = v0_block / (a_board - a_block)
    x_rel_at_common = 0.5 * v0_block * t_common  # area of triangle in v-t graph

    separated = x_rel_at_common > board_length + 1e-9
    if separated:
        # Solve 0.5 * (a_block - a_board) * t^2 + v0_block * t - board_length = 0
        A = 0.5 * (a_block - a_board)
        B = v0_block
        C = -board_length
        disc = max(0.0, B * B - 4 * A * C)
        t_sep = (-B + math.sqrt(disc)) / (2 * A)
        t_end = t_sep
        v_common = None
        state = "分离型板块（滑块从木板右端滑离）"
    else:
        t_sep = None
        v_common = a_board * t_common
        # After common velocity, decelerate together under ground friction if moving
        if board_moves and v_common > 1e-9:
            a_together = -mu2 * g
            t_stop = v_common / (-a_together)
            t_end = t_common + t_stop
        else:
            t_end = t_common
        state = "共速型板块（未滑离，最终共速）"

    q_heat = f1 * min(x_rel_at_common, board_length)
    return {
        "f1": f1,
        "f2_max": f2_max,
        "board_moves": board_moves,
        "a_block": a_block,
        "a_board": a_board,
        "t_common": t_common,
        "v_common": v_common,
        "x_rel_at_common": x_rel_at_common,
        "separated": separated,
        "t_sep": t_sep,
        "t_end": t_end,
        "q_heat": q_heat,
        "state": state,
    }


def solve_charged_particle_circle(
    q: float, m: float, v: float, B: float, theta_rad: Optional[float] = None
) -> Dict[str, Any]:
    """
    Uniform magnetic field circular motion: r = mv/(|q|B), T = 2*pi*m/(|q|B).
    """
    r = (m * v) / (abs(q) * B)
    T = (2 * math.pi * m) / (abs(q) * B)
    omega = (abs(q) * B) / m
    res: Dict[str, Any] = {"r": r, "T": T, "omega": omega}
    if theta_rad is not None:
        res["t_in_field"] = (theta_rad / (2 * math.pi)) * T
        res["chord_length"] = 2 * r * math.sin(theta_rad / 2.0)
    return res


def verify_vernier_caliper(
    divisions: int,
    main_mm: int,
    aligned_k: int,
    main_aligned_mm: Optional[int] = None,
    tail_main_mm_floor: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Exact geometric self-consistency check for a vernier caliper reading.
    - divisions: 10, 20, or 50 (standard span = divisions - 1 mm, e.g., 9mm, 19mm, 49mm)
    - main_mm: integer mm read to the left of vernier 0 mark (M_0)
    - aligned_k: index of aligned vernier tick (0 .. divisions)
    - main_aligned_mm: which main-scale mm tick is aligned with aligned_k.
      Must satisfy: main_aligned_mm == main_mm + aligned_k (for 1-mm-span vernier)!
    - tail_main_mm_floor: integer main-scale mm to the left of the vernier's last tick.
      Must satisfy: tail_main_mm_floor == main_mm + (divisions - 1) (when aligned_k > 0).
    """
    if divisions not in (10, 20, 50):
        raise ValueError(f"Unsupported vernier divisions: {divisions}")
    resolution = 1.0 / divisions
    span_mm = divisions - 1
    pitch_mm = span_mm / divisions
    reading_mm = round(main_mm + aligned_k * resolution, 3)
    expected_aligned_main = round(reading_mm + aligned_k * pitch_mm)
    tail_pos_mm = round(reading_mm + span_mm, 3)

    ok = True
    errors = []
    if main_aligned_mm is not None and main_aligned_mm != expected_aligned_main:
        ok = False
        errors.append(
            f"对齐刻度矛盾: 主尺读 {main_mm}mm + 第{aligned_k}格对齐时，主尺被对齐线必为 {expected_aligned_main}mm，而非 {main_aligned_mm}mm"
        )
    if tail_main_mm_floor is not None and int(math.floor(tail_pos_mm)) != tail_main_mm_floor:
        ok = False
        errors.append(
            f"尾线位置矛盾: 读数 {reading_mm}mm 时副尺尾线应在 {tail_pos_mm}mm (即 {int(math.floor(tail_pos_mm))}mm 右侧)，而非 {tail_main_mm_floor}mm 右侧"
        )
    fmt = f"{reading_mm:.1f}" if divisions == 10 else f"{reading_mm:.2f}"
    return {
        "ok": ok,
        "reading_mm": reading_mm,
        "formatted_mm": fmt,
        "expected_aligned_main_mm": expected_aligned_main,
        "tail_pos_mm": tail_pos_mm,
        "errors": errors,
    }


def verify_symbolic(expr_lhs: str, expr_rhs: str, subs: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
    """Optional SymPy symbolic equivalence check."""
    if not HAS_SYMPY:
        return {"has_sympy": False, "verified": None, "note": "sympy 未安装，跳过符号校验"}
    lhs = sp.sympify(expr_lhs)
    rhs = sp.sympify(expr_rhs)
    diff = sp.simplify(lhs - rhs)
    result: Dict[str, Any] = {"has_sympy": True, "diff": str(diff), "verified": diff == 0}
    if subs:
        result["lhs_val"] = float(lhs.subs(subs))
        result["rhs_val"] = float(rhs.subs(subs))
    return result
