# Mail service

_Manage uploading file, limit size, temporary file ..._


| No.<a name='ANCHOR_-1'></a> | APIs List |       |
|---: | ---- | ----  |
|  | **Authorization APIs** *- 2 items* | **[Import](http://test.onapis.com/Test/eJzNUt9rwjAQ/lfk2GO3NkMcFPYQ1qLCrKJ1MqQPsY20W9qUJN2m4v++S+fAMej2aB+au9z3o3zX9QFKbnKZgQ+zZQwONEpgnRtT+64rZMpELrXxB4R4LmsQqoq9m/FSukoKjoScs4wrDf4BUlkZXplrs6s5irC6FkXKTCEr90XLCsHfCu0lQp5Xc8NW/UE2fNpn9P4ejg5sZLazai0Fz+UinNtTWjL4a1iEUYBaNLDvRUjn5GGEVTyiESEjSBwoWSEsMg4XMSGkhUUBsQ8kaDGZBlbxSvGttrjWAnnbQvCvi9njlAYtlgaTcfTbPznibCtViSOsykaYombK2Bb7ipU2gmWdMcN7p6gU17WsNLdq2jDToNet13dOTcw/kA4/M23e+UbL9JUbbOHNuyF3NiSUZRaLJSZsreh5tD06G2scnq13GF7kev+T4pCb7gi9zgj//u7OkC/4D+zefvIJ8NA6Uw==)** |
|**1.**| [Update role](#id8044911957221279) | [Test](http://test.onapis.com/Test/eJxlUFtLwzAU/ivj4GO1i4wJhT0EW9zAdWPtHCJ7yNozWk2bkKTqNvbfPakTFPOQc/su8J2gQVepEiJYrnMIoDOS+so5HYWhVIWQlbIuGjM2DEVHUFMfwxIbFRolkQgVihKNhegEhWodtu7aHTSSiNBa1oVwtWrDV6taAv8o9EuCPG9WTmxG4/Lh6VjyyQTOAexUefBqPYXqOktWvipPhugFsiSNSYvH/s8SvmL3U+ryKU8Zm8I2gEbU0iPzJMsZYz0sjZl/sCWL+SL2ilcG99bjegvi7WuJ34vl44LHPZbH81n63397pttemYZO1DWddLUWxvmR5lY0PoK1LoXDwSUqg1ar1qJXs064jrxuh6PgMuT4SXT4m2n3gTurijd0NML78Ibd+ZBIVngstZSwt+K/ox3w5czC+QvhkZbc) |
|**2.**| [Get role](#id1246932165968015.5) | [Test](http://test.onapis.com/Test/eJyVUNFKwzAU/ZVx8XHaRmRCYQ/Blm3gurFWh8gesiaj1bQpya26jf27N90EwSfzkNx7Oefcc3KEWmFpJEQwSXIYQmc11SViGwWBNoXQpXEYjRgLA9ER1FaHQKraBNZoRYRSCamsg+gIhWlQNXiN+1aRiGhbXRUCK9MEb840BP5R6IcEeVmvUKzvRnLyfJB8PIbTELZG7r1aT4mONNkZW5+rutNYtcKib6lvRO03TRQOLnascq1pnPIKDgV25Ow2DIeXJldfxIX/+u4+1daZ4l0hEeAjvGH33qoUKLzAU5as/Gt8PoheIUvSmGg89neW8BV7mFKVT3nK2BQ2lERU2iPzJMsZYz0sjZk/sCHp+SL2ildW7ZzH9SuIt6u0Og+Wjwse91gez2fp3/2bk/8iCuJD8d8/P+DLmYPTN4OoooU=) |

## APIs Detail
### Authorization APIs
1. <a name='id8044911957221279'></a>[**Update role**](http://test.onapis.com/Test/eJxlUFtLwzAU/ivj4GO1i4wJhT0EW9zAdWPtHCJ7yNozWk2bkKTqNvbfPakTFPOQc/su8J2gQVepEiJYrnMIoDOS+so5HYWhVIWQlbIuGjM2DEVHUFMfwxIbFRolkQgVihKNhegEhWodtu7aHTSSiNBa1oVwtWrDV6taAv8o9EuCPG9WTmxG4/Lh6VjyyQTOAexUefBqPYXqOktWvipPhugFsiSNSYvH/s8SvmL3U+ryKU8Zm8I2gEbU0iPzJMsZYz0sjZl/sCWL+SL2ilcG99bjegvi7WuJ34vl44LHPZbH81n63397pttemYZO1DWddLUWxvmR5lY0PoK1LoXDwSUqg1ar1qJXs064jrxuh6PgMuT4SXT4m2n3gTurijd0NML78Ibd+ZBIVngstZSwt+K/ox3w5czC+QvhkZbc) - [TOP ⇪](#ANCHOR_-1)

    **`PUT`** **204** `${url}/:project/role`
    
    Request Header:
    ```json
    {
      "content-type": "application/json",
      "authorization": "YWRtaW46dGVzdA=="
    }
    ```
    
    Request Body:
    ```json
    {
      "USER": {
        "oauth": [
          "SEND",
          "ADD",
          "SEAR1CH",
          "THAN11H"
        ],
        "mail": [
          "TEST111",
          "SEND11111"
        ]
      },
      "MOD": {
        "$refs": [
          "USER"
        ],
        "files": [
          "UPLOAD"
        ]
      },
      "ADMIN": {
        "oauth": [
          "SEND"
        ]
      }
    }
    ```
    
    Response Header:
    ```json
    {
      "uwebsockets": "v0.17"
    }
    ```
    
    ~~Response Data~~
    
    
    
2. <a name='id1246932165968015.5'></a>[**Get role**](http://test.onapis.com/Test/eJyVUNFKwzAU/ZVx8XHaRmRCYQ/Blm3gurFWh8gesiaj1bQpya26jf27N90EwSfzkNx7Oefcc3KEWmFpJEQwSXIYQmc11SViGwWBNoXQpXEYjRgLA9ER1FaHQKraBNZoRYRSCamsg+gIhWlQNXiN+1aRiGhbXRUCK9MEb840BP5R6IcEeVmvUKzvRnLyfJB8PIbTELZG7r1aT4mONNkZW5+rutNYtcKib6lvRO03TRQOLnascq1pnPIKDgV25Ow2DIeXJldfxIX/+u4+1daZ4l0hEeAjvGH33qoUKLzAU5as/Gt8PoheIUvSmGg89neW8BV7mFKVT3nK2BQ2lERU2iPzJMsZYz0sjZk/sCHp+SL2ildW7ZzH9SuIt6u0Og+Wjwse91gez2fp3/2bk/8iCuJD8d8/P+DLmYPTN4OoooU=) - [TOP ⇪](#ANCHOR_-1)

    **`GET`** **200** `${url}/:project/role`
    
    Request Header:
    ```json
    {
      "content-type": "application/json",
      "authorization": "YWRtaW46dGVzdA=="
    }
    ```
    
    ~~Request Body~~
    
    Response Header:
    ```json
    {
      "content-type": "application/json",
      "uwebsockets": "v0.17"
    }
    ```
    
    Response Data:
    ```json
    {
      "USER": {
        "oauth": [
          "SEND",
          "ADD",
          "SEAR1CH",
          "THAN11H"
        ],
        "mail": [
          "TEST111",
          "SEND11111"
        ]
      },
      "MOD": {
        "$refs": [
          "USER"
        ],
        "files": [
          "UPLOAD"
        ]
      },
      "ADMIN": {
        "oauth": [
          "SEND"
        ]
      }
    }
    ```
    
    
    