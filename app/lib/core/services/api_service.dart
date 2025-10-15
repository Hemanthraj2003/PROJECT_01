import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../constants/app_constants.dart';

class ApiService {
  final http.Client _client = http.Client();

  // Check network connectivity
  Future<bool> _checkNetwork() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  // Handle API response
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 500) {
      throw Exception(AppConstants.serverError);
    }

    final data = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Request failed');
    }
  }

  // Generic GET request
  Future<dynamic> get(
    String endpoint, {
    Map<String, String>? queryParams,
  }) async {
    if (!await _checkNetwork()) {
      throw Exception(AppConstants.offlineError);
    }

    try {
      var uri = Uri.parse('${AppConstants.baseUrl}$endpoint');
      if (queryParams != null) {
        uri = uri.replace(queryParameters: queryParams);
      }

      print('Making GET request to: $uri');

      final response = await _client.get(
        uri,
        headers: {'Content-Type': 'application/json'},
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      return _handleResponse(response);
    } on SocketException {
      throw Exception(AppConstants.offlineError);
    } catch (e) {
      print('GET request error: $e');
      throw Exception(e.toString());
    }
  }

  // Generic POST request
  Future<dynamic> post(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
  }) async {
    if (!await _checkNetwork()) {
      throw Exception(AppConstants.offlineError);
    }

    try {
      var uri = Uri.parse('${AppConstants.baseUrl}$endpoint');

      // Add query parameters if provided
      if (queryParams != null && queryParams.isNotEmpty) {
        uri = uri.replace(queryParameters: queryParams);
      }

      print('Making POST request to: $uri');
      if (body != null) {
        print('Request body: ${jsonEncode(body)}');
      }

      final response = await _client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: body != null ? jsonEncode(body) : null,
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      return _handleResponse(response);
    } on SocketException {
      throw Exception(AppConstants.offlineError);
    } catch (e) {
      print('POST request error: $e');
      throw Exception(e.toString());
    }
  }

  // Generic PUT request
  Future<dynamic> put(String endpoint, {Map<String, dynamic>? body}) async {
    if (!await _checkNetwork()) {
      throw Exception(AppConstants.offlineError);
    }

    try {
      final uri = Uri.parse('${AppConstants.baseUrl}$endpoint');

      final response = await _client.put(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: body != null ? jsonEncode(body) : null,
      );

      return _handleResponse(response);
    } on SocketException {
      throw Exception(AppConstants.offlineError);
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Upload images
  Future<dynamic> uploadImages(List<dynamic> images) async {
    if (!await _checkNetwork()) {
      throw Exception(AppConstants.offlineError);
    }

    try {
      final uri = Uri.parse(
        '${AppConstants.baseUrl}${AppConstants.uploadImagesEndpoint}',
      );

      var request = http.MultipartRequest('POST', uri);

      // Add files to request
      for (var image in images) {
        if (image is File) {
          // Get file extension to determine mime type
          final extension = image.path.split('.').last.toLowerCase();

          var multipartFile = await http.MultipartFile.fromPath(
            'images',
            image.path,
            contentType: MediaType(
              'image',
              extension == 'png' ? 'png' : 'jpeg',
            ),
          );
          request.files.add(multipartFile);
        }
      }

      print('Uploading ${images.length} images to: $uri');
      print('Request files: ${request.files.length}');

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      print('Upload response status: ${response.statusCode}');
      print('Upload response body: ${response.body}');

      // Handle empty response body
      if (response.body.isEmpty) {
        if (response.statusCode == 405) {
          throw Exception(
            'Upload endpoint not available. Please contact support.',
          );
        }
        throw Exception(
          'Server returned empty response (${response.statusCode})',
        );
      }

      return _handleResponse(response);
    } on SocketException {
      throw Exception(AppConstants.offlineError);
    } catch (e) {
      print('Image upload error: $e');
      throw Exception('Failed to upload images: ${e.toString()}');
    }
  }

  void dispose() {
    _client.close();
  }
}
