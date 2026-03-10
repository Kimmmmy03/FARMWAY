import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class FarmerHomeScreen extends StatefulWidget {
  const FarmerHomeScreen({super.key});

  @override
  State<FarmerHomeScreen> createState() => _FarmerHomeScreenState();
}

class _FarmerHomeScreenState extends State<FarmerHomeScreen> {
  int _currentIndex = 0;
  List<dynamic> _products = [];
  List<dynamic> _orders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final auth = context.read<AuthService>();
      final prodRes = await ApiService.get('/products/farmer/${auth.user!.id}');
      final orderRes = await ApiService.get('/orders');
      if (mounted) {
        setState(() {
          _products = prodRes['data'] ?? [];
          _orders = (orderRes['data'] ?? []) as List;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    final screens = [
      _DashboardTab(
        products: _products, orders: _orders,
        loading: _loading, user: auth.user, onRefresh: _loadData,
      ),
      _MyProductsTab(products: _products, loading: _loading),
      const _FarmerOrdersTab(),
      _FarmerProfileTab(user: auth.user, onLogout: () => auth.logout()),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5)),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(icon: Icons.dashboard_rounded, label: 'Dashboard', index: 0,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.inventory_2_rounded, label: 'Products', index: 1,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.receipt_long_rounded, label: 'Orders', index: 2,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.person_outline_rounded, label: 'Profile', index: 3,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: _currentIndex == 1
          ? FloatingActionButton.extended(
              onPressed: () {},
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text('Add Product', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            )
          : null,
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int current;
  final ValueChanged<int> onTap;

  const _NavItem({
    required this.icon, required this.label, required this.index,
    required this.current, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final selected = index == current;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: selected ? AppColors.primary : AppColors.textMuted, size: 24),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(
              fontSize: 11,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              color: selected ? AppColors.primary : AppColors.textMuted,
            )),
          ],
        ),
      ),
    );
  }
}

// ─── Dashboard Tab ──────────────────────────────────────

class _DashboardTab extends StatelessWidget {
  final List<dynamic> products;
  final List<dynamic> orders;
  final bool loading;
  final dynamic user;
  final VoidCallback onRefresh;

  const _DashboardTab({
    required this.products, required this.orders,
    required this.loading, required this.user, required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => onRefresh(),
        color: AppColors.primary,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Welcome header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, Color(0xFF2E8B57)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 5)),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Welcome back,', style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8))),
                        const SizedBox(height: 4),
                        Text(
                          user?.fullName?.split(' ').first ?? 'Farmer',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const SizedBox(height: 8),
                        if (user?.isVerifiedSeller == true)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.verified, color: Colors.white, size: 14),
                                SizedBox(width: 4),
                                Text('Verified Seller', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    width: 60, height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text(
                        (user?.fullName ?? 'F')[0].toUpperCase(),
                        style: const TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Stats row
            Row(
              children: [
                _StatCard(icon: Icons.inventory_2_rounded, label: 'Products', value: '${products.length}', color: AppColors.primary),
                const SizedBox(width: 12),
                _StatCard(icon: Icons.shopping_bag_rounded, label: 'Orders', value: '${orders.length}', color: AppColors.accent),
                const SizedBox(width: 12),
                _StatCard(icon: Icons.star_rounded, label: 'Rating', value: '4.8', color: const Color(0xFF8B5CF6)),
              ],
            ),

            const SizedBox(height: 28),
            const Text('Recent Orders', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),

            if (loading)
              const Center(child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: AppColors.primary),
              ))
            else if (orders.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.inbox_rounded, size: 48, color: AppColors.textMuted),
                    SizedBox(height: 10),
                    Text('No orders yet', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                    SizedBox(height: 4),
                    Text('Orders will appear here', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  ],
                ),
              )
            else
              ...orders.take(5).map((o) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  leading: Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.receipt_rounded, color: AppColors.accent, size: 20),
                  ),
                  title: Text('#${(o['id'] as String).substring(0, 8)}',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: Text(o['status'] ?? '', style: const TextStyle(fontSize: 12)),
                  trailing: Text('RM ${o['total_amount']}',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
                ),
              )),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}

// ─── Products Tab ───────────────────────────────────────

class _MyProductsTab extends StatelessWidget {
  final List<dynamic> products;
  final bool loading;

  const _MyProductsTab({required this.products, required this.loading});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Text('My Products', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Text('Manage your listings', style: TextStyle(color: AppColors.textMuted)),
          ),
          if (loading)
            const Expanded(child: Center(child: CircularProgressIndicator(color: AppColors.primary)))
          else if (products.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(Icons.inventory_2_rounded, size: 40, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 16),
                    const Text('No products listed', style: TextStyle(color: AppColors.textSecondary, fontSize: 17, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    const Text('Tap + to add your first product', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: products.length,
                itemBuilder: (_, i) {
                  final p = products[i];
                  final name = p['name'];
                  final displayName = name is Map ? (name['en'] ?? '') : name.toString();
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey.shade100),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      leading: Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceAlt,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.eco_rounded, color: AppColors.primary),
                      ),
                      title: Text(displayName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text('RM ${p['price_per_unit']} / ${p['unit']}  •  Stock: ${p['stock_quantity']}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(p['status'] ?? 'ACTIVE',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.success)),
                      ),
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Orders Tab ─────────────────────────────────────────

class _FarmerOrdersTab extends StatelessWidget {
  const _FarmerOrdersTab();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Orders', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            const Text('Manage incoming orders', style: TextStyle(color: AppColors.textMuted)),
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.receipt_long_rounded, size: 64, color: AppColors.textMuted),
                    SizedBox(height: 16),
                    Text('No orders yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 17, fontWeight: FontWeight.w600)),
                    SizedBox(height: 6),
                    Text('Incoming orders will show here', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Profile Tab ────────────────────────────────────────

class _FarmerProfileTab extends StatelessWidget {
  final dynamic user;
  final VoidCallback onLogout;
  const _FarmerProfileTab({required this.user, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text('Profile', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryLight]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  child: Text(
                    (user?.fullName ?? 'F')[0].toUpperCase(),
                    style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'Farmer',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text(user?.email ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('FARMER', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                          ),
                          if (user?.isVerifiedSeller == true) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.verified, color: Colors.white, size: 12),
                                  SizedBox(width: 3),
                                  Text('Verified', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _MenuItem(icon: Icons.edit_outlined, label: 'Edit Profile'),
          _MenuItem(icon: Icons.account_balance_outlined, label: 'Bank Details'),
          _MenuItem(icon: Icons.translate_rounded, label: 'Language'),
          _MenuItem(icon: Icons.help_outline_rounded, label: 'Help & Support'),
          const SizedBox(height: 12),
          _MenuItem(icon: Icons.logout_rounded, label: 'Log Out', isDestructive: true, onTap: onLogout),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDestructive;
  final VoidCallback? onTap;

  const _MenuItem({required this.icon, required this.label, this.isDestructive = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: isDestructive ? AppColors.error.withValues(alpha: 0.1) : AppColors.surfaceAlt,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: isDestructive ? AppColors.error : AppColors.primary, size: 20),
        ),
        title: Text(label, style: TextStyle(
          fontWeight: FontWeight.w500,
          color: isDestructive ? AppColors.error : AppColors.textPrimary,
        )),
        trailing: isDestructive ? null : const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
