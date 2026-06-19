import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/fidelity_provider.dart';
import '../../widgets/kpi_card.dart';
import '../../widgets/coupon_card.dart';

class FidelityScreen extends StatefulWidget {
  const FidelityScreen({super.key});

  @override
  State<FidelityScreen> createState() => _FidelityScreenState();
}

class _FidelityScreenState extends State<FidelityScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FidelityProvider>().loadFidelityData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fidelity = context.watch<FidelityProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fidelidade'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Pontos'),
            Tab(text: 'Cashback'),
            Tab(text: 'Cupons'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPointsTab(fidelity),
          _buildCashbackTab(fidelity),
          _buildCouponsTab(fidelity),
        ],
      ),
    );
  }

  Widget _buildPointsTab(FidelityProvider fidelity) {
    if (fidelity.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryGreen, AppTheme.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryGreen.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Seus Pontos',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        fidelity.tier,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  '${fidelity.totalPoints}',
                  style: GoogleFonts.inter(
                    fontSize: 56,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                if (fidelity.pointsToNextTier > 0) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: fidelity.progressToNextTier.clamp(0.0, 1.0),
                      backgroundColor: Colors.white.withOpacity(0.2),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.gold),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Mais ${fidelity.pointsToNextTier} pontos para ${fidelity.nextTier}',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Expanded(
                  child: KpiCard(
                    icon: Icons.card_giftcard,
                    label: 'Pontos',
                    value: '${fidelity.totalPoints}',
                    color: AppTheme.gold,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: KpiCard(
                    icon: Icons.monetization_on_outlined,
                    label: 'Cashback',
                    value: 'R\$ ${fidelity.cashbackBalance.toStringAsFixed(2)}',
                    color: AppTheme.cashback,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: KpiCard(
                    icon: Icons.confirmation_number,
                    label: 'Cupons',
                    value: '${fidelity.activeCoupons.length}',
                    color: AppTheme.accent,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _showConvertDialog(fidelity),
                icon: const Icon(Icons.swap_horiz),
                label: const Text('Converter Pontos em Cashback'),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Histórico de Pontos',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () => fidelity.loadPointsHistory(),
                  child: const Text('Atualizar'),
                ),
              ],
            ),
          ),
          fidelity.pointsHistory.isEmpty
              ? Padding(
                  padding: const EdgeInsets.all(40),
                  child: Text(
                    'Nenhum registro de pontos ainda',
                    style: GoogleFonts.inter(color: AppTheme.textSecondary),
                  ),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: fidelity.pointsHistory.length,
                  itemBuilder: (context, index) {
                    final p = fidelity.pointsHistory[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: (p['type'] == 'earned' ? AppTheme.success : AppTheme.error)
                            .withOpacity(0.1),
                        child: Icon(
                          p['type'] == 'earned' ? Icons.add : Icons.remove,
                          color: p['type'] == 'earned' ? AppTheme.success : AppTheme.error,
                        ),
                      ),
                      title: Text(p['description'] ?? ''),
                      trailing: Text(
                        '${p['type'] == 'earned' ? '+' : '-'}${p['points']} pts',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          color: p['type'] == 'earned' ? AppTheme.success : AppTheme.error,
                        ),
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }

  Widget _buildCashbackTab(FidelityProvider fidelity) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    'Saldo Disponível',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'R\$ ${fidelity.cashbackBalance.toStringAsFixed(2)}',
                    style: GoogleFonts.inter(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.cashback,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: fidelity.cashbackBalance >= 5
                          ? () => _showCashbackRedeemDialog(fidelity)
                          : null,
                      icon: const Icon(Icons.redeem),
                      label: const Text('Resgatar Cashback'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Como funciona?',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.cashback.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                _buildStepItem(1, 'Ganhe 10 pontos a cada R\$ 1,00 em compras'),
                const SizedBox(height: 12),
                _buildStepItem(2, 'Acumule pontos e suba de nível'),
                const SizedBox(height: 12),
                _buildStepItem(3, 'Converta pontos em cashback a qualquer momento'),
                const SizedBox(height: 12),
                _buildStepItem(4, 'Use o cashback em suas próximas compras'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepItem(int number, String text) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: const BoxDecoration(
            color: AppTheme.cashback,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '$number',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCouponsTab(FidelityProvider fidelity) {
    if (fidelity.coupons.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.confirmation_number_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'Nenhum cupom disponível',
              style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'Ganhe cupons trocando seus pontos!',
              style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => _showGenerateCouponDialog(fidelity),
              icon: const Icon(Icons.add),
              label: const Text('Gerar Cupom'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: fidelity.coupons.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.all(8),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _showGenerateCouponDialog(fidelity),
                icon: const Icon(Icons.add),
                label: const Text('Gerar Novo Cupom'),
              ),
            ),
          );
        }
        final coupon = fidelity.coupons[index - 1];
        return CouponCard(
          code: coupon.code,
          title: coupon.title,
          discount: coupon.discountText,
          validUntil: coupon.formattedValidUntil,
          isExpired: coupon.isExpired,
          isUsed: coupon.isUsed,
          onTap: () => _showCouponDetails(coupon),
        );
      },
    );
  }

  void _showConvertDialog(FidelityProvider fidelity) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Converter Pontos'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Seus pontos: ${fidelity.totalPoints}'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Pontos para converter',
                hintText: 'Mínimo 100 pontos',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              final points = int.tryParse(controller.text) ?? 0;
              if (points >= 100) {
                fidelity.convertPointsToCashback(points);
                Navigator.pop(context);
              }
            },
            child: const Text('Converter'),
          ),
        ],
      ),
    );
  }

  void _showCashbackRedeemDialog(FidelityProvider fidelity) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Resgatar Cashback'),
        content: Text('Deseja resgatar R\$ ${fidelity.cashbackBalance.toStringAsFixed(2)} em cashback?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Cashback resgatado com sucesso!'),
                  backgroundColor: AppTheme.success,
                ),
              );
            },
            child: const Text('Resgatar'),
          ),
        ],
      ),
    );
  }

  void _showGenerateCouponDialog(FidelityProvider fidelity) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Gerar Cupom'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Use ${fidelity.totalPoints} pontos disponíveis'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Pontos (100 = R\$ 5 OFF)',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () {
              final points = int.tryParse(controller.text) ?? 0;
              if (points >= 100) {
                fidelity.generateCoupon(points);
                Navigator.pop(context);
              }
            },
            child: const Text('Gerar'),
          ),
        ],
      ),
    );
  }

  void _showCouponDetails(coupon) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Icon(Icons.confirmation_number, size: 48, color: AppTheme.primaryGreen),
            const SizedBox(height: 16),
            Text(
              coupon.code,
              style: GoogleFonts.inter(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              coupon.discountText,
              style: GoogleFonts.inter(
                fontSize: 18,
                color: AppTheme.primaryGreen,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Válido até ${coupon.formattedValidUntil}',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Usar Cupom'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
