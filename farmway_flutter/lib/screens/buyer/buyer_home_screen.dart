import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class BuyerHomeScreen extends StatefulWidget {
  const BuyerHomeScreen({super.key});

  @override
  State<BuyerHomeScreen> createState() => _BuyerHomeScreenState();
}

class _BuyerHomeScreenState extends State<BuyerHomeScreen> {
  int _currentIndex = 0;
  List<dynamic> _categories = [];
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final catRes = await ApiService.get('/categories');
      final prodRes = await ApiService.get('/products');
      if (mounted) {
        setState(() {
          _categories = catRes['data'] ?? [];
          _products = prodRes['data'] ?? [];
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
      _MarketplaceTab(
        categories: _categories,
        products: _products,
        loading: _loading,
        onRefresh: _loadData,
        userName: auth.user?.fullName ?? 'there',
      ),
      const _OrdersTab(),
      const _ChatTab(),
      _ProfileTab(user: auth.user, onLogout: () => auth.logout()),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(icon: Icons.storefront_rounded, label: 'Market', index: 0,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.receipt_long_rounded, label: 'Orders', index: 1,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.chat_bubble_outline_rounded, label: 'Chat', index: 2,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
                _NavItem(icon: Icons.person_outline_rounded, label: 'Profile', index: 3,
                    current: _currentIndex, onTap: (i) => setState(() => _currentIndex = i)),
              ],
            ),
          ),
        ),
      ),
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

// ─── Marketplace Tab ────────────────────────────────────

class _MarketplaceTab extends StatelessWidget {
  final List<dynamic> categories;
  final List<dynamic> products;
  final bool loading;
  final VoidCallback onRefresh;
  final String userName;

  const _MarketplaceTab({
    required this.categories, required this.products,
    required this.loading, required this.onRefresh, required this.userName,
  });

  static const _categoryIcons = {
    'vegetables': '🥬', 'fruits': '🍎', 'livestock': '🐄',
    'aquaculture': '🐟', 'grains': '🌾', 'herbs': '🌿',
    'farm_tools': '🔧', 'services': '🚜',
  };

  String _getCatName(dynamic cat) {
    final n = cat['name'];
    return n is Map ? (n['en'] ?? n.values.first ?? '') : n?.toString() ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async => onRefresh(),
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryLight],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(28),
                    bottomRight: Radius.circular(28),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Hello, ${userName.split(' ').first} 👋',
                                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white)),
                              const SizedBox(height: 4),
                              Text('Find fresh produce near you',
                                style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8))),
                            ],
                          ),
                        ),
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.notifications_none_rounded, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    // Search bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.search, color: AppColors.textMuted, size: 22),
                          SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: 'Search vegetables, fruits...',
                                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                          Icon(Icons.tune_rounded, color: AppColors.primary, size: 22),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (loading)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AppColors.primary)))
            else ...[
              // Categories
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      Text('See all', style: TextStyle(fontSize: 13, color: AppColors.primary.withValues(alpha: 0.8), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: categories.length,
                    itemBuilder: (_, i) {
                      final cat = categories[i];
                      final slug = cat['slug'] ?? '';
                      return Container(
                        width: 78,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        child: Column(
                          children: [
                            Container(
                              width: 52, height: 52,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceAlt,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: Text(
                                  _categoryIcons[slug] ?? '📦',
                                  style: const TextStyle(fontSize: 24),
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _getCatName(cat),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Products section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Fresh Today', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      Text('See all', style: TextStyle(fontSize: 13, color: AppColors.primary.withValues(alpha: 0.8), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),

              if (products.isEmpty)
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.symmetric(vertical: 48),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade100),
                    ),
                    child: const Column(
                      children: [
                        Icon(Icons.local_florist_rounded, size: 56, color: AppColors.textMuted),
                        SizedBox(height: 12),
                        Text('No products yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16, fontWeight: FontWeight.w600)),
                        SizedBox(height: 4),
                        Text('Check back soon for fresh produce!', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverGrid(
                    delegate: SliverChildBuilderDelegate(
                      (_, i) {
                        final p = products[i];
                        final name = p['name'];
                        final displayName = name is Map ? (name['en'] ?? '') : name.toString();
                        return Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey.shade100),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 100,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceAlt,
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                ),
                                child: const Center(child: Icon(Icons.eco_rounded, size: 40, color: AppColors.primary)),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(displayName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 4),
                                    Text('RM ${p['price_per_unit']}/${p['unit']}',
                                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                      childCount: products.length,
                    ),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.85,
                    ),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Orders Tab ─────────────────────────────────────────

class _OrdersTab extends StatelessWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('My Orders', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('Track your purchases', style: TextStyle(color: AppColors.textMuted)),
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.receipt_long_rounded, size: 64, color: AppColors.textMuted),
                    SizedBox(height: 16),
                    Text('No orders yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 17, fontWeight: FontWeight.w600)),
                    SizedBox(height: 6),
                    Text('Your orders will appear here', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
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

// ─── Chat Tab ───────────────────────────────────────────

class _ChatTab extends StatelessWidget {
  const _ChatTab();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Messages', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            const Text('Chat with farmers', style: TextStyle(color: AppColors.textMuted)),
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.chat_bubble_outline_rounded, size: 64, color: AppColors.textMuted),
                    SizedBox(height: 16),
                    Text('No messages yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 17, fontWeight: FontWeight.w600)),
                    SizedBox(height: 6),
                    Text('Start a conversation with a farmer', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
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

class _ProfileTab extends StatelessWidget {
  final dynamic user;
  final VoidCallback onLogout;
  const _ProfileTab({required this.user, required this.onLogout});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const SizedBox(height: 10),
          const Text('Profile', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 24),

          // Profile card
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
                    (user?.fullName ?? 'U')[0].toUpperCase(),
                    style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'User',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text(user?.email ?? '', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(user?.role ?? '', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu items
          _ProfileMenuItem(icon: Icons.edit_outlined, label: 'Edit Profile'),
          _ProfileMenuItem(icon: Icons.location_on_outlined, label: 'Delivery Addresses'),
          _ProfileMenuItem(icon: Icons.translate_rounded, label: 'Language'),
          _ProfileMenuItem(icon: Icons.help_outline_rounded, label: 'Help & Support'),
          _ProfileMenuItem(icon: Icons.info_outline_rounded, label: 'About Farmway'),
          const SizedBox(height: 12),
          _ProfileMenuItem(icon: Icons.logout_rounded, label: 'Log Out', isDestructive: true, onTap: onLogout),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDestructive;
  final VoidCallback? onTap;

  const _ProfileMenuItem({required this.icon, required this.label, this.isDestructive = false, this.onTap});

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
