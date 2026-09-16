/**
 * Target-vs-yours matplotlib matching. The student writes real pyplot
 * (plot / scatter / errorbar / …); the harness fingerprints artists so
 * scoring is about the figure, not PNG pixels.
 */

export const PREPEND = `import matplotlib
matplotlib.use("Agg")
import numpy as np
`;

const FINGERPRINT_PY = `
import json
import base64
import os
from io import BytesIO

import matplotlib.colors as mcolors
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection, PathCollection, PolyCollection
from matplotlib.container import BarContainer, ErrorbarContainer

try:
    from matplotlib.container import StemContainer
except ImportError:
    class StemContainer:
        pass

try:
    from mpl_toolkits.mplot3d.art3d import Line3DCollection, Poly3DCollection, Path3DCollection
except Exception:
    class Line3DCollection:
        pass
    class Poly3DCollection:
        pass
    class Path3DCollection:
        pass

def _num(v, nd=4):
    try:
        return round(float(v), nd)
    except (TypeError, ValueError):
        return 0.0

def _nums(vs, nd=4):
    return [_num(v, nd) for v in list(vs)]

def _hex(c):
    try:
        return mcolors.to_hex(c, keep_alpha=False)
    except (ValueError, TypeError):
        return str(c)

def _rgba(c):
    try:
        r, g, b, a = mcolors.to_rgba(c)
        return [_num(r, 3), _num(g, 3), _num(b, 3), _num(a, 2)]
    except (ValueError, TypeError):
        return [0, 0, 0, 1]

def _ls(style):
    table = {
        "-": "solid", "--": "dashed", "-.": "dashdot", ":": "dotted",
        "solid": "solid", "dashed": "dashed", "dashdot": "dashdot",
        "dotted": "dotted", "None": "none", "none": "none", " ": "none",
    }
    return table.get(str(style), str(style))

def _marker(mark):
    s = str(mark) if mark is not None else "None"
    return "None" if s in ("", "none", "None") else s

def _label(lab):
    s = "" if lab is None else str(lab)
    return "" if s.startswith("_") else s

def _line_fp(line):
    z = None
    if hasattr(line, "get_data_3d"):
        try:
            x, y, z = line.get_data_3d()
        except Exception:
            x, y = line.get_data()
            z = None
    else:
        x, y = line.get_data()
    spec = {
        "kind": "line3d" if z is not None else "line",
        "x": _nums(x),
        "y": _nums(y),
        "color": _hex(line.get_color()),
        "ls": _ls(line.get_linestyle()),
        "lw": _num(line.get_linewidth(), 2),
        "marker": _marker(line.get_marker()),
        "label": _label(line.get_label()),
    }
    if z is not None:
        spec["z"] = _nums(z)
    return spec

def _errorbar_fp(container):
    data_line, _caps, barlinecols = container
    segs = []
    for lc in barlinecols:
        for seg in lc.get_segments():
            pts = tuple(_num(v) for p in seg for v in p)
            segs.append(pts)
    spec = _line_fp(data_line)
    spec["kind"] = "errorbar"
    spec["err"] = sorted(segs)
    return spec

def _bar_fp(container):
    bars = []
    for patch in list(container):
        bars.append({
            "x": _num(patch.get_x() + patch.get_width() / 2),
            "h": _num(patch.get_height()),
            "w": _num(patch.get_width(), 3),
            "color": _hex(patch.get_facecolor()),
        })
    return bars

def _scatter_fp(coll):
    offs = coll.get_offsets()
    sizes = coll.get_sizes()
    fcs = coll.get_facecolors()
    return {
        "kind": "scatter",
        "xy": [[_num(x), _num(y)] for x, y in offs],
        "sizes": [_num(s, 1) for s in sizes],
        "colors": [_hex(c) for c in (fcs if len(fcs) else [])],
    }

def _fill_fp(coll):
    paths = coll.get_paths()
    xs, ys = [], []
    n = 0
    if paths:
        verts = paths[0].vertices
        n = len(verts)
        xs = [p[0] for p in verts]
        ys = [p[1] for p in verts]
    fcs = coll.get_facecolors()
    fc = _rgba(fcs[0]) if len(fcs) else [0, 0, 0, 1]
    bbox = [_num(min(xs), 3), _num(max(xs), 3), _num(min(ys), 3), _num(max(ys), 3)] if xs else [0, 0, 0, 0]
    return {"kind": "fill", "n": n, "bbox": bbox, "fc": fc}

def _grid_on(ax):
    xg = any(gl.get_visible() for gl in ax.get_xgridlines())
    yg = any(gl.get_visible() for gl in ax.get_ygridlines())
    return bool(xg or yg)

def _is_3d(ax):
    return str(getattr(ax, "name", "")) == "3d"

def _coll_color(coll, getter):
    try:
        cols = getter()
        if cols is not None and len(cols):
            return _hex(cols[0])
    except Exception:
        pass
    return ""

def _wire_fp(coll):
    segs = []
    try:
        segs = list(coll.get_segments())
    except Exception:
        segs = []
    zs = []
    for seg in segs:
        for p in seg:
            if len(p) >= 3:
                zs.append(p[2])
    return {
        "kind": "wire",
        "n": len(segs),
        "zmin": _num(min(zs), 3) if zs else 0,
        "zmax": _num(max(zs), 3) if zs else 0,
        "color": _coll_color(coll, coll.get_edgecolor),
    }

def _surface_fp(coll):
    paths = []
    try:
        paths = coll.get_paths()
    except Exception:
        paths = []
    fcs = []
    try:
        fcs = coll.get_facecolors()
    except Exception:
        fcs = []
    return {
        "kind": "surface",
        "n": len(paths),
        "nfc": int(len(fcs)),
        "fc": _rgba(fcs[0]) if len(fcs) else [0, 0, 0, 1],
        "ec": _coll_color(coll, coll.get_edgecolor),
    }

def _scatter3d_fp(coll):
    xyz = []
    n = 0
    offs3d = getattr(coll, "_offsets3d", None)
    if offs3d is not None:
        xs, ys, zs = offs3d
        xs, ys, zs = list(xs), list(ys), list(zs)
        n = len(xs)
        xyz = [[_num(a), _num(b), _num(c)] for a, b, c in zip(xs, ys, zs)]
    else:
        offs = coll.get_offsets()
        n = len(offs)
        xyz = [[_num(x), _num(y), 0] for x, y in offs]
    fcs = coll.get_facecolors()
    return {
        "kind": "scatter3d",
        "n": n,
        "xyz": xyz,
        "sizes": [_num(s, 1) for s in coll.get_sizes()],
        "colors": [_hex(c) for c in (fcs if len(fcs) else [])],
    }

def fingerprint(fig):
    try:
        fig.canvas.draw()
    except Exception:
        pass
    axes = []
    for ax in fig.axes:
        skip_lines = set()
        skip_coll = set()
        errorbars = []
        bars = []
        stems = []
        for container in ax.containers:
            if isinstance(container, ErrorbarContainer):
                skip_lines.add(container[0])
                skip_lines.update(container[1])
                skip_coll.update(container[2])
                errorbars.append(_errorbar_fp(container))
            elif isinstance(container, BarContainer):
                bars.append(_bar_fp(container))
            elif isinstance(container, StemContainer):
                markerline, stemlines, baseline = container
                skip_lines.add(markerline)
                if baseline is not None:
                    skip_lines.add(baseline)
                if hasattr(stemlines, "__iter__") and not hasattr(stemlines, "get_segments"):
                    skip_lines.update(stemlines)
                else:
                    skip_coll.add(stemlines)
                x, y = markerline.get_data()
                stems.append({
                    "kind": "stem",
                    "x": _nums(x),
                    "y": _nums(y),
                    "color": _hex(markerline.get_color()),
                })
        lines = []
        for line in ax.get_lines():
            if line in skip_lines:
                continue
            lines.append(_line_fp(line))
        scatters = []
        fills = []
        wires = []
        surfaces = []
        scatters3d = []
        for coll in ax.collections:
            if coll in skip_coll:
                continue
            cname = type(coll).__name__
            if cname == "Line3DCollection" or isinstance(coll, Line3DCollection):
                wires.append(_wire_fp(coll))
            elif cname == "Poly3DCollection" or isinstance(coll, Poly3DCollection):
                surfaces.append(_surface_fp(coll))
            elif cname == "Path3DCollection" or isinstance(coll, Path3DCollection):
                scatters3d.append(_scatter3d_fp(coll))
            elif isinstance(coll, PolyCollection):
                fills.append(_fill_fp(coll))
            elif isinstance(coll, PathCollection) and not isinstance(coll, LineCollection):
                if len(coll.get_offsets()):
                    scatters.append(_scatter_fp(coll))
        legend = []
        leg = ax.get_legend()
        if leg is not None:
            legend = [t.get_text() for t in leg.texts]
        texts = []
        for t in ax.texts:
            s = t.get_text()
            if not s:
                continue
            pos = t.get_position()
            texts.append({"text": s, "x": _num(pos[0], 2), "y": _num(pos[1], 2)})
        contours = []
        for art in ax.get_children():
            levels = getattr(art, "levels", None)
            allsegs = getattr(art, "allsegs", None)
            if levels is None or allsegs is None:
                continue
            contours.append({
                "levels": [_num(v, 3) for v in levels],
                "nsegs": int(sum(len(seg) for seg in allsegs)),
            })
        d3 = _is_3d(ax)
        zlim = None
        zlabel = ""
        elev = None
        azim = None
        if d3:
            try:
                zlim = [_num(v, 2) for v in ax.get_zlim()]
            except Exception:
                zlim = [0, 0]
            try:
                zlabel = ax.get_zlabel()
            except Exception:
                zlabel = ""
            elev = _num(getattr(ax, "elev", 0), 1)
            azim = _num(getattr(ax, "azim", 0), 1)
        box_aspect = None
        if d3:
            try:
                ba = ax.get_box_aspect()
                if ba is not None:
                    box_aspect = [_num(float(v), 3) for v in list(ba)]
            except Exception:
                box_aspect = None
        pos = ax.get_position()
        slider = (not d3) and pos.height < 0.09 and pos.width > 0.25
        axes.append({
            "title": ax.get_title(),
            "xlabel": ax.get_xlabel(),
            "ylabel": ax.get_ylabel(),
            "xscale": ax.get_xscale(),
            "yscale": ax.get_yscale(),
            "xlim": [_num(v, 2) for v in ax.get_xlim()],
            "ylim": [_num(v, 2) for v in ax.get_ylim()],
            "grid": _grid_on(ax),
            "polar": str(getattr(ax, "name", "")) == "polar",
            "d3": d3,
            "zlim": zlim,
            "zlabel": zlabel,
            "elev": elev,
            "azim": azim,
            "box_aspect": box_aspect,
            "slider": slider,
            "legend": legend,
            "texts": texts,
            "lines": lines,
            "errorbars": errorbars,
            "bars": bars,
            "stems": stems,
            "scatters": scatters,
            "fills": fills,
            "contours": contours,
            "wires": wires,
            "surfaces": surfaces,
            "scatters3d": scatters3d,
        })
    try:
        fw, fh = fig.get_size_inches()
        figsize = [_num(fw, 2), _num(fh, 2)]
    except Exception:
        figsize = [0, 0]
    spacing = {}
    try:
        sp = fig.subplotpars
        spacing = {
            "left": _num(sp.left, 3),
            "right": _num(sp.right, 3),
            "top": _num(sp.top, 3),
            "bottom": _num(sp.bottom, 3),
            "wspace": _num(sp.wspace, 3),
            "hspace": _num(sp.hspace, 3),
        }
    except Exception:
        spacing = {}
    return {"figsize": figsize, "axes": axes, "spacing": spacing, "saved": []}

def saved_exts():
    out = []
    try:
        names = os.listdir(".")
    except Exception:
        names = []
    for name in names:
        if "." not in name:
            continue
        ext = name.rsplit(".", 1)[-1].lower()
        if ext in ("png", "pdf", "svg", "eps", "ps"):
            out.append(ext)
    return sorted(set(out))

def wipe_saved():
    try:
        names = os.listdir(".")
    except Exception:
        names = []
    for name in names:
        if "." not in name:
            continue
        ext = name.rsplit(".", 1)[-1].lower()
        if ext in ("png", "pdf", "svg", "eps", "ps"):
            try:
                os.remove(name)
            except Exception:
                pass

def _add(score, ok, w):
    score[1] += w
    if ok:
        score[0] += w

def _pad(xs, n):
    out = list(xs)
    while len(out) < n:
        out.append(None)
    return out

def _eq(a, b, w, score):
    _add(score, a == b, w)

def _maybe(tval, sval, default, w, score):
    if tval != default or sval != default:
        _eq(tval, sval, w, score)

def _cmp_line(t, s, score, data_w=8):
    if t is None or s is None:
        _add(score, False, data_w * 2 + 4 + 4 + 4 + 1)
        return
    _eq(t.get("x"), s.get("x"), data_w, score)
    _eq(t.get("y"), s.get("y"), data_w, score)
    _eq(t.get("color"), s.get("color"), 4, score)
    _eq(t.get("ls"), s.get("ls"), 4, score)
    _eq(t.get("marker"), s.get("marker"), 4, score)
    _eq(t.get("lw"), s.get("lw"), 1, score)
    _maybe(t.get("label"), s.get("label"), "", 2, score)
    if "z" in t or (s is not None and "z" in s):
        _eq(t.get("z"), s.get("z"), data_w, score)
    if "err" in t or (s is not None and "err" in s):
        _eq(t.get("err"), s.get("err"), 6, score)

def _cmp_list(ts, ss, score, cmp_one, empty_w):
    n = max(len(ts), len(ss))
    _eq(len(ts), len(ss), 3, score)
    if n == 0:
        return
    for t, s in zip(_pad(ts, n), _pad(ss, n)):
        cmp_one(t, s, score)

def _axes_of(fp):
    if isinstance(fp, dict):
        return fp.get("axes") or []
    return fp or []

def compare(target, student):
    score = [0, 0]
    if isinstance(target, dict) and isinstance(student, dict):
        _eq(target.get("figsize"), student.get("figsize"), 3, score)
        _eq(target.get("spacing"), student.get("spacing"), 4, score)
        _eq(target.get("saved") or [], student.get("saved") or [], 4, score)
    t_axes = _axes_of(target)
    s_axes = _axes_of(student)
    nax = max(len(t_axes), len(s_axes), 1)
    _eq(len(t_axes), len(s_axes), 4, score)
    for ta, sa in zip(_pad(t_axes, nax), _pad(s_axes, nax)):
        if ta is None or sa is None:
            _add(score, False, 20)
            continue
        _maybe(ta["title"], sa["title"], "", 3, score)
        _maybe(ta["xlabel"], sa["xlabel"], "", 3, score)
        _maybe(ta["ylabel"], sa["ylabel"], "", 3, score)
        _maybe(ta["xscale"], sa["xscale"], "linear", 3, score)
        _maybe(ta["yscale"], sa["yscale"], "linear", 3, score)
        _maybe(ta["grid"], sa["grid"], False, 3, score)
        _maybe(ta.get("polar"), sa.get("polar"), False, 4, score)
        _maybe(ta.get("d3"), sa.get("d3"), False, 4, score)
        _maybe(ta.get("slider"), sa.get("slider"), False, 3, score)
        _maybe(ta.get("zlabel"), sa.get("zlabel"), "", 3, score)
        if ta.get("d3") or sa.get("d3"):
            _eq(ta.get("zlim"), sa.get("zlim"), 2, score)
            _eq(ta.get("elev"), sa.get("elev"), 2, score)
            _eq(ta.get("azim"), sa.get("azim"), 2, score)
            if ta.get("box_aspect") or sa.get("box_aspect"):
                _eq(ta.get("box_aspect"), sa.get("box_aspect"), 3, score)
        _maybe(ta["legend"], sa["legend"], [], 3, score)
        _maybe(ta["texts"], sa["texts"], [], 3, score)
        _eq(ta["xlim"], sa["xlim"], 2, score)
        _eq(ta["ylim"], sa["ylim"], 2, score)
        _cmp_list(ta["lines"], sa["lines"], score, _cmp_line, 5)
        _cmp_list(ta["errorbars"], sa["errorbars"], score, _cmp_line, 5)
        def _cmp_plain(t, s, sc):
            _eq(t, s, 5 if t is not None and s is not None else 5, sc)
        _cmp_list(ta["bars"], sa["bars"], score, _cmp_plain, 5)
        _cmp_list(ta.get("stems") or [], sa.get("stems") or [], score, _cmp_plain, 5)
        _cmp_list(ta["scatters"], sa["scatters"], score, _cmp_plain, 5)
        _cmp_list(ta["fills"], sa["fills"], score, _cmp_plain, 5)
        _cmp_list(ta.get("contours") or [], sa.get("contours") or [], score, _cmp_plain, 5)
        _cmp_list(ta.get("wires") or [], sa.get("wires") or [], score, _cmp_plain, 5)
        _cmp_list(ta.get("surfaces") or [], sa.get("surfaces") or [], score, _cmp_plain, 5)
        _cmp_list(ta.get("scatters3d") or [], sa.get("scatters3d") or [], score, _cmp_plain, 5)
    tot = score[1]
    pct = round(100 * score[0] / tot) if tot else 0
    return {"exact": score[0], "total": tot, "shape": pct, "overall": pct}

def save_png(fig):
    buf = BytesIO()
    fig.savefig(buf, format="png", dpi=100, bbox_inches="tight", facecolor="white")
    return base64.b64encode(buf.getvalue()).decode()
`;

function wrapTarget(targetCode, dataPy = '') {
  return `
plt.close("all")
${dataPy}
${targetCode}
_fig = plt.gcf()
`;
}

export function buildTargetOnlyHarness(targetCode, dataPy = '') {
  return `
${PREPEND}
${FINGERPRINT_PY}
${wrapTarget(targetCode, dataPy)}
print("PISTON_PNG:" + save_png(_fig))
plt.close("all")
`;
}

export function buildHarness(targetCode, dataPy = '') {
  return `
${FINGERPRINT_PY}

_student_saved = saved_exts()
_student_fig = plt.gcf()
_student_fp = fingerprint(_student_fig)
_student_fp["saved"] = _student_saved
_student_png = save_png(_student_fig)
wipe_saved()

${wrapTarget(targetCode, dataPy)}
_target_fp = fingerprint(_fig)
_target_fp["saved"] = saved_exts()
plt.close("all")

print("PISTON_PNG:" + _student_png)
print("SCORE:" + json.dumps(compare(_target_fp, _student_fp)))
`;
}
