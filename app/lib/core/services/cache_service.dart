import 'dart:async';

/// Simple in-memory cache with TTL (Time To Live)
class CacheService {
  static final CacheService _instance = CacheService._internal();
  factory CacheService() => _instance;
  CacheService._internal();

  final Map<String, _CacheEntry> _cache = {};
  Timer? _cleanupTimer;

  /// Default cache duration (5 minutes)
  static const Duration defaultTTL = Duration(minutes: 5);

  /// Initialize cache service with periodic cleanup
  void initialize() {
    // Clean expired entries every 2 minutes
    _cleanupTimer?.cancel();
    _cleanupTimer = Timer.periodic(const Duration(minutes: 2), (_) {
      _cleanupExpired();
    });
  }

  /// Store data in cache with optional TTL
  void set<T>(String key, T data, {Duration? ttl}) {
    _cache[key] = _CacheEntry(
      data: data,
      expiresAt: DateTime.now().add(ttl ?? defaultTTL),
    );
  }

  /// Retrieve data from cache
  T? get<T>(String key) {
    final entry = _cache[key];
    if (entry == null) return null;

    // Check if expired
    if (entry.expiresAt.isBefore(DateTime.now())) {
      _cache.remove(key);
      return null;
    }

    return entry.data as T?;
  }

  /// Check if key exists and is not expired
  bool has(String key) {
    final entry = _cache[key];
    if (entry == null) return false;

    if (entry.expiresAt.isBefore(DateTime.now())) {
      _cache.remove(key);
      return false;
    }

    return true;
  }

  /// Remove specific key
  void remove(String key) {
    _cache.remove(key);
  }

  /// Clear all cache
  void clear() {
    _cache.clear();
  }

  /// Remove expired entries
  void _cleanupExpired() {
    final now = DateTime.now();
    _cache.removeWhere((key, entry) => entry.expiresAt.isBefore(now));
    print('🧹 Cache cleanup: ${_cache.length} entries remaining');
  }

  /// Get cache statistics
  Map<String, dynamic> getStats() {
    final now = DateTime.now();
    final expired = _cache.values
        .where((e) => e.expiresAt.isBefore(now))
        .length;

    return {
      'total': _cache.length,
      'active': _cache.length - expired,
      'expired': expired,
    };
  }

  /// Dispose cache service
  void dispose() {
    _cleanupTimer?.cancel();
    _cache.clear();
  }
}

class _CacheEntry {
  final dynamic data;
  final DateTime expiresAt;

  _CacheEntry({required this.data, required this.expiresAt});
}
