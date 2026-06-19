import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../providers/schedule_provider.dart';
import '../../widgets/schedule_card.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  late DateTime _currentMonth;
  bool _showWeekView = false;

  @override
  void initState() {
    super.initState();
    _currentMonth = DateTime(DateTime.now().year, DateTime.now().month);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSchedule();
    });
  }

  void _loadSchedule() {
    final startOfMonth = DateTime(_currentMonth.year, _currentMonth.month, 1);
    final endOfMonth = DateTime(_currentMonth.year, _currentMonth.month + 1, 0);
    context.read<ScheduleProvider>().loadSchedule(
      startDate: startOfMonth,
      endDate: endOfMonth,
    );
  }

  void _previousMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1);
      _loadSchedule();
    });
  }

  void _nextMonth() {
    setState(() {
      _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1);
      _loadSchedule();
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheduleProvider = context.watch<ScheduleProvider>();
    final schedules = scheduleProvider.thisWeekSchedule;
    final today = DateTime.now();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Escala de Trabalho'),
        actions: [
          IconButton(
            icon: Icon(_showWeekView ? Icons.calendar_view_month : Icons.calendar_view_week),
            onPressed: () => setState(() => _showWeekView = !_showWeekView),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildMonthNavigator(),
          if (_showWeekView)
            Expanded(child: _buildWeekView(scheduleProvider, today))
          else
            Expanded(child: _buildMonthView(scheduleProvider)),
        ],
      ),
    );
  }

  Widget _buildMonthNavigator() {
    final months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: _previousMonth,
          ),
          Text(
            '${months[_currentMonth.month - 1]} ${_currentMonth.year}',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: _nextMonth,
          ),
        ],
      ),
    );
  }

  Widget _buildWeekView(ScheduleProvider provider, DateTime today) {
    final startOfWeek = today.subtract(Duration(days: today.weekday - 1));
    final weekSchedules = provider.thisWeekSchedule;

    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(7, (index) {
              final date = startOfWeek.add(Duration(days: index));
              final isToday = date.day == today.day && date.month == today.month;
              final daySchedules = weekSchedules.where((s) =>
                  s.date.day == date.day && s.date.month == date.month).toList();
              final hasSchedule = daySchedules.isNotEmpty;

              return GestureDetector(
                onTap: () {},
                child: Column(
                  children: [
                    Text(
                      ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index],
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: isToday ? AppTheme.primaryGreen : AppTheme.textSecondary,
                        fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: isToday ? AppTheme.primaryGreen : (hasSchedule ? AppTheme.accent.withOpacity(0.2) : null),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text('${date.day}',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: isToday ? Colors.white : AppTheme.textPrimary,
                              fontWeight: FontWeight.w600,
                            )),
                      ),
                    ),
                    if (hasSchedule) ...[
                      const SizedBox(height: 2),
                      Text('${daySchedules.first.startTime}',
                          style: GoogleFonts.inter(fontSize: 9, color: AppTheme.textSecondary)),
                    ],
                  ],
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: weekSchedules.isEmpty
              ? Center(child: Text('Nenhuma escala para esta semana',
                  style: GoogleFonts.inter(color: AppTheme.textSecondary)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: weekSchedules.length,
                  itemBuilder: (context, index) {
                    return ScheduleCard(schedule: weekSchedules[index]);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildMonthView(ScheduleProvider provider) {
    final schedules = provider.schedules;

    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (schedules.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_month_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Nenhuma escala para este mês',
                style: GoogleFonts.inter(fontSize: 16, color: AppTheme.textSecondary)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: schedules.length,
      itemBuilder: (context, index) {
        return ScheduleCard(schedule: schedules[index]);
      },
    );
  }
}
