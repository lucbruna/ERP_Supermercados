import 'package:flutter/material.dart';
import '../config/theme.dart';

class BottomNav extends StatelessWidget {
  final int currentIndex;
  final int cartItemCount;
  final Function(int) onTap;

  const BottomNav({
    super.key,
    required this.currentIndex,
    this.cartItemCount = 0,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      items: [
        const BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Início',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.shopping_bag_outlined),
          activeIcon: Icon(Icons.shopping_bag),
          label: 'Produtos',
        ),
        BottomNavigationBarItem(
          icon: Stack(
            children: [
              const Icon(Icons.shopping_cart_outlined),
              if (cartItemCount > 0)
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      cartItemCount > 9 ? '9+' : '$cartItemCount',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          activeIcon: Stack(
            children: [
              const Icon(Icons.shopping_cart),
              if (cartItemCount > 0)
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      cartItemCount > 9 ? '9+' : '$cartItemCount',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          label: 'Carrinho',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.card_giftcard_outlined),
          activeIcon: Icon(Icons.card_giftcard),
          label: 'Fidelidade',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.more_horiz_outlined),
          activeIcon: Icon(Icons.more_horiz),
          label: 'Mais',
        ),
      ],
    );
  }
}
