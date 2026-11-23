#!/usr/bin/env python3
"""Render an explicit access URL as a text QR; does not start/probe a service."""
from __future__ import annotations
import argparse
import ipaddress
import re
import sys
from urllib.parse import urlsplit


def checked_url(value: str) -> str:
    if any(c.isspace() or ord(c) < 32 or ord(c) == 127 for c in value):
        raise ValueError("Whitespace and control characters are not permitted")
    parts = urlsplit(value)
    if parts.scheme not in {"http", "https"} or not parts.hostname:
        raise ValueError("Supply a complete http(s) access URL")
    if "@" in parts.netloc or parts.username is not None or parts.password is not None or parts.query or parts.fragment:
        raise ValueError("QR access URLs must not contain credentials, query tokens or fragments")
    if parts.hostname in {"0.0.0.0", "::", "*"}:
        raise ValueError("Use an actual advertised address, not a wildcard listener")
    try:
        port = parts.port
        if port is not None and not 1 <= port <= 65535:
            raise ValueError("Invalid port")
    except ValueError as error:
        raise ValueError("Invalid URL port") from error
    try:
        address = ipaddress.ip_address(parts.hostname)
    except ValueError:
        if re.fullmatch(r"[0-9.]+", parts.hostname) or ":" in parts.hostname:
            raise ValueError("Invalid IP address")
        try:
            host = parts.hostname.rstrip(".").encode("idna").decode("ascii")
        except UnicodeError as error:
            raise ValueError("Invalid hostname") from error
        if len(host) > 253 or any(not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", label) for label in host.split(".")):
            raise ValueError("Invalid hostname")
    else:
        if address.is_unspecified or address.is_multicast:
            raise ValueError("Use an actual unicast client address")
    return value


def qr_matrix(value: str) -> list[list[bool]]:
    try:
        import qrcode
    except ImportError as error:
        raise RuntimeError("Install requirements-validation.txt in an isolated environment to render QR codes.") from error
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4, box_size=1)
    code.add_data(checked_url(value))
    code.make(fit=True)
    return code.get_matrix()


def render_matrix(matrix: list[list[bool]], style: str = "unicode", invert: bool = False) -> str:
    if not matrix or any(len(row) != len(matrix) for row in matrix):
        raise ValueError("QR matrix must be nonempty and square")
    def dark(value): return not value if invert else value
    if style == "ascii":
        return "\n".join("".join("##" if dark(c) else "  " for c in row) for row in matrix)
    if style != "unicode": raise ValueError("Unknown text style")
    result = []
    for offset in range(0, len(matrix), 2):
        top = matrix[offset]
        bottom = matrix[offset + 1] if offset + 1 < len(matrix) else [False] * len(matrix)
        line = []
        for a, b in zip(top, bottom):
            pair = (dark(a), dark(b))
            line.append({(False, False): " ", (True, False): "▀", (False, True): "▄", (True, True): "█"}[pair])
        result.append("".join(line))
    return "\n".join(result)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--style", choices=["unicode", "ascii"], default="unicode")
    parser.add_argument("--invert", action="store_true", help="Invert for terminal background/foreground contrast")
    args = parser.parse_args()
    try:
        value = checked_url(args.url)
        rendered = render_matrix(qr_matrix(value), args.style, args.invert)
        print("Operator-supplied address: " + value)
        print("This helper renders the URL only; it does not start or verify a dashboard.")
        print(rendered)
        print("Pairing code, if required, is entered separately and is not encoded here.")
        return 0
    except (ValueError, RuntimeError, UnicodeEncodeError) as error:
        print(str(error), file=sys.stderr)
        if isinstance(error, UnicodeEncodeError): print("Retry with --style ascii.", file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
