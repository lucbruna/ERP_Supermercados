import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class CouponCard extends StatelessWidget {
  final String code;
  final String title;
  final String discount;
  final String validUntil;
  final bool isExpired;
  final bool isUsed;
  final VoidCallback? onTap;

  const CouponCard({
    super.key,
    required this.code,
    required this.title,
    required this.discount,
    required this.validUntil,
    this.isExpired = false,
    this.isUsed = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isInactive = isExpired || isUsed;

    return GestureDetector(
      onTap: isInactive ? null : onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isInactive
                ? [Colors.grey[200]!, Colors.grey[100]!]
                : [AppTheme.primaryGreen, AppTheme.primaryLight],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: isInactive
              ? []
              : [
                  BoxShadow(
                    color: AppTheme.primaryGreen.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.confirmation_number,
                color: isInactive ? Colors.grey : Colors.white,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    code,
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isInactive ? Colors.grey[600] : Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: isInactive ? Colors.grey[500] : Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        discount,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isInactive ? Colors.grey[500] : Colors.white,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Válido: $validUntil',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: isInactive ? Colors.grey[500] : Colors.white60,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (isInactive)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black12,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isUsed ? 'Usado' : 'Expirado',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                  ),
                ),
              )
            else
              const Icon(Icons.chevron_right, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
